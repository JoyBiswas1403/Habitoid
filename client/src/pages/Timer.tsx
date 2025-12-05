import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Maximize2,
  Minimize2,
  Settings,
  Target,
  Music,
  Volume2,
  VolumeX,
  X,
  Check
} from "lucide-react";
import { SlashCharacter } from "@/components/SlashCharacter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { sendFocusComplete, getNotificationSettings } from "@/lib/notifications";

// Focus duration options (in minutes)
const FOCUS_DURATIONS = [15, 25, 45, 60];
const BREAK_DURATIONS = [5, 10, 15];

// Ambient sound options
const AMBIENT_SOUNDS = [
  { id: 'none', name: 'No Sound', icon: '🔇' },
  { id: 'rain', name: 'Rain', icon: '🌧️', url: 'https://www.youtube.com/embed/mPZkdNFkNps?autoplay=1&loop=1' },
  { id: 'lofi', name: 'Lo-Fi', icon: '🎵', url: 'https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1&loop=1' },
  { id: 'nature', name: 'Nature', icon: '🌿', url: 'https://www.youtube.com/embed/eKFTSSKCzWA?autoplay=1&loop=1' },
  { id: 'fire', name: 'Fireplace', icon: '🔥', url: 'https://www.youtube.com/embed/L_LUpnjgPso?autoplay=1&loop=1' },
];

export default function Timer() {
  // Timer state
  const [focusDuration, setFocusDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [sessionType, setSessionType] = useState<'focus' | 'break'>('focus');

  // Settings state
  const [showSettings, setShowSettings] = useState(false);
  const [dailyGoal, setDailyGoal] = useState(4);

  // Habit linking
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
  const [showHabitSelector, setShowHabitSelector] = useState(false);

  // Music state
  const [currentSound, setCurrentSound] = useState<string>('none');
  const [isMuted, setIsMuted] = useState(false);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: habits = [] } = useQuery({
    queryKey: ["/api/habits"],
  });

  const { data: todaySessions = [] } = useQuery({
    queryKey: ["/api/pomodoro/today"],
  });

  // Calculate today's completed focus sessions
  const completedToday = (todaySessions as any[]).filter(
    (s: any) => s.completed && s.sessionType === 'focus'
  ).length;

  const logSessionMutation = useMutation({
    mutationFn: (data: { duration: number; sessionType: string; completed: boolean; habitId?: string }) =>
      apiRequest("POST", "/api/pomodoro", {
        ...data,
        date: new Date().toISOString().split("T")[0],
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pomodoro/today"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
  });

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      if (sessionType === 'focus') {
        logSessionMutation.mutate({
          duration: focusDuration,
          sessionType: 'focus',
          completed: true,
          habitId: selectedHabitId || undefined
        });
        toast({ title: "🎉 Focus Session Complete!", description: `+${focusDuration} points earned!` });
        // Send browser notification
        const notifSettings = getNotificationSettings();
        if (notifSettings.enabled && notifSettings.focusAlerts) {
          const habitName = selectedHabitId ? (habits as any[]).find(h => h.id === selectedHabitId)?.name : undefined;
          sendFocusComplete(focusDuration, habitName);
        }
        // Auto switch to break
        setSessionType('break');
        setTimeLeft(breakDuration * 60);
      } else {
        toast({ title: "Break over! Ready for another focus session?" });
        setSessionType('focus');
        setTimeLeft(focusDuration * 60);
      }
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isActive, timeLeft, sessionType, focusDuration, breakDuration]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartFocus = () => {
    if (!isActive && sessionType === 'focus') {
      setShowHabitSelector(true);
    } else {
      setIsActive(!isActive);
    }
  };

  const startWithHabit = (habitId: string | null) => {
    setSelectedHabitId(habitId);
    setShowHabitSelector(false);
    setIsActive(true);
  };

  const resetTimer = () => {
    setIsActive(false);
    setSessionType('focus');
    setTimeLeft(focusDuration * 60);
    setSelectedHabitId(null);
  };

  const progress = sessionType === 'focus'
    ? timeLeft / (focusDuration * 60)
    : timeLeft / (breakDuration * 60);

  const selectedHabit = (habits as any[]).find(h => h.id === selectedHabitId);

  // Full-screen Focus Mode
  if (isFocusMode) {
    return (
      <div
        className="fixed inset-0 z-[200] flex flex-col items-center justify-center animate-in fade-in"
        style={{ backgroundColor: 'var(--sidebar)', color: 'white', animationDuration: '500ms' }}
      >
        {/* Hidden YouTube iframe for audio */}
        {currentSound !== 'none' && !isMuted && (
          <iframe
            src={AMBIENT_SOUNDS.find(s => s.id === currentSound)?.url}
            className="hidden"
            allow="autoplay"
          />
        )}

        {/* Top controls */}
        <div className="absolute top-8 left-8 right-8 flex justify-between items-center">
          {/* Sound controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 rounded-full"
              style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
            >
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            <div className="flex gap-1">
              {AMBIENT_SOUNDS.map(sound => (
                <button
                  key={sound.id}
                  onClick={() => setCurrentSound(sound.id)}
                  className="w-8 h-8 rounded-full text-sm flex items-center justify-center transition-all"
                  style={{
                    backgroundColor: currentSound === sound.id ? 'var(--primary)' : 'rgba(255,255,255,0.1)'
                  }}
                  title={sound.name}
                >
                  {sound.icon}
                </button>
              ))}
            </div>
          </div>

          {/* Exit button */}
          <button
            onClick={() => setIsFocusMode(false)}
            className="p-2 rounded-full"
            style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
          >
            <Minimize2 size={24} />
          </button>
        </div>

        {/* Session type indicator */}
        <div
          className="px-4 py-2 rounded-full mb-8 font-bold"
          style={{
            backgroundColor: sessionType === 'focus' ? 'var(--primary)' : '#3b82f6',
            color: 'white'
          }}
        >
          {sessionType === 'focus' ? '🎯 Focus Time' : '☕ Break Time'}
        </div>

        {/* Linked habit */}
        {selectedHabit && (
          <div className="text-center mb-4" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Working on: <span className="font-bold text-white">{selectedHabit.icon} {selectedHabit.name}</span>
          </div>
        )}

        {/* Slash with expression based on session type */}
        <div className="w-48 h-48 mb-6 relative">
          <SlashCharacter
            expression={sessionType === 'focus' ? 'focus' : 'happy'}
            className="w-full h-full animate-pulse"
          />
        </div>

        {/* Giant timer */}
        <div className="text-[100px] font-black tabular-nums leading-none mb-8 tracking-tighter">
          {formatTime(timeLeft)}
        </div>

        {/* Progress bar */}
        <div className="w-64 h-2 rounded-full mb-8" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${progress * 100}%`,
              backgroundColor: sessionType === 'focus' ? 'var(--primary)' : '#3b82f6'
            }}
          />
        </div>

        {/* Controls */}
        <div className="flex gap-4">
          <button
            className="w-32 h-12 text-xl rounded-lg font-bold transition-all active:scale-95 shadow-md"
            style={{ backgroundColor: 'var(--primary)', color: 'white' }}
            onClick={() => setIsActive(!isActive)}
          >
            {isActive ? 'Pause' : 'Resume'}
          </button>
          <button
            className="w-32 h-12 text-xl rounded-lg font-bold transition-all active:scale-95"
            style={{ backgroundColor: '#ef4444', color: 'white' }}
            onClick={() => { resetTimer(); setIsFocusMode(false); }}
          >
            Stop
          </button>
        </div>
      </div>
    );
  }

  // Normal timer view
  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black">Focus Timer</h1>
          <p className="font-medium" style={{ color: 'var(--muted)' }}>Stay focused, stay productive</p>
        </div>
        <button
          onClick={() => setShowSettings(true)}
          className="p-2 rounded-lg border"
          style={{ borderColor: 'var(--border)' }}
        >
          <Settings size={20} />
        </button>
      </div>

      {/* Daily Goal Progress */}
      <div
        className="rounded-2xl p-6 border"
        style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Target size={24} style={{ color: 'var(--primary)' }} />
            <div>
              <p className="font-bold">Daily Goal</p>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>
                {completedToday} / {dailyGoal} sessions
              </p>
            </div>
          </div>
          {completedToday >= dailyGoal && (
            <div
              className="px-3 py-1 rounded-full text-sm font-bold"
              style={{ backgroundColor: 'var(--primary)', color: 'white' }}
            >
              🎉 Goal Reached!
            </div>
          )}
        </div>
        <div className="h-3 rounded-full" style={{ backgroundColor: 'var(--border)' }}>
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${Math.min((completedToday / dailyGoal) * 100, 100)}%`,
              backgroundColor: completedToday >= dailyGoal ? '#22c55e' : 'var(--primary)'
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timer Card */}
        <div
          className="rounded-2xl p-8 border text-center"
          style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
        >
          {/* Session Type Tabs */}
          <div className="flex justify-center gap-2 mb-6">
            <button
              onClick={() => { setSessionType('focus'); setTimeLeft(focusDuration * 60); setIsActive(false); }}
              className="px-4 py-2 rounded-lg font-bold transition-all"
              style={{
                backgroundColor: sessionType === 'focus' ? 'var(--primary)' : 'transparent',
                color: sessionType === 'focus' ? 'white' : 'var(--muted)'
              }}
            >
              Focus ({focusDuration}m)
            </button>
            <button
              onClick={() => { setSessionType('break'); setTimeLeft(breakDuration * 60); setIsActive(false); }}
              className="px-4 py-2 rounded-lg font-bold transition-all"
              style={{
                backgroundColor: sessionType === 'break' ? '#3b82f6' : 'transparent',
                color: sessionType === 'break' ? 'white' : 'var(--muted)'
              }}
            >
              Break ({breakDuration}m)
            </button>
          </div>

          {/* Linked Habit Display */}
          {selectedHabit && (
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4"
              style={{ backgroundColor: 'var(--accent-light)' }}
            >
              <span>{selectedHabit.icon}</span>
              <span className="font-medium text-sm">{selectedHabit.name}</span>
              <button onClick={() => setSelectedHabitId(null)} className="ml-1">
                <X size={14} />
              </button>
            </div>
          )}

          {/* Circular Timer */}
          <div className="relative w-64 h-64 mx-auto mb-6 flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle cx="128" cy="128" r="120" fill="none" stroke="currentColor" strokeOpacity="0.1" strokeWidth="8" />
              <circle
                cx="128" cy="128" r="120"
                fill="none"
                stroke={sessionType === 'focus' ? '#50A65C' : '#3b82f6'}
                strokeWidth="8"
                strokeDasharray="753"
                strokeDashoffset={753 - (753 * progress)}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-linear"
              />
            </svg>
            <div className="z-10 text-5xl font-black tracking-tighter tabular-nums">
              {formatTime(timeLeft)}
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-4">
            <button
              className="px-8 py-3 text-lg rounded-lg font-bold transition-all active:scale-95 shadow-md"
              style={{ backgroundColor: 'var(--primary)', color: 'white' }}
              onClick={handleStartFocus}
            >
              {isActive ? 'Pause' : 'Start Focus'}
            </button>
            <button
              className="px-4 py-3 rounded-lg font-bold transition-all active:scale-95 border-2"
              style={{ borderColor: 'var(--border)' }}
              onClick={resetTimer}
            >
              Reset
            </button>
            <button
              onClick={() => setIsFocusMode(true)}
              className="px-4 py-3 rounded-lg font-bold transition-all active:scale-95 border-2"
              style={{ borderColor: 'var(--border)' }}
              title="Enter Focus Mode"
            >
              <Maximize2 size={20} />
            </button>
          </div>
        </div>

        {/* Ambient Sounds Card */}
        <div
          className="rounded-2xl p-6 border"
          style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Music size={20} style={{ color: 'var(--primary)' }} />
            <h2 className="font-bold">Focus Sounds</h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {AMBIENT_SOUNDS.map(sound => (
              <button
                key={sound.id}
                onClick={() => setCurrentSound(sound.id)}
                className="flex items-center gap-3 p-4 rounded-xl border-2 transition-all"
                style={{
                  borderColor: currentSound === sound.id ? 'var(--primary)' : 'var(--border)',
                  backgroundColor: currentSound === sound.id ? 'var(--accent-light)' : 'transparent'
                }}
              >
                <span className="text-2xl">{sound.icon}</span>
                <span className="font-medium">{sound.name}</span>
                {currentSound === sound.id && (
                  <Check size={16} className="ml-auto" style={{ color: 'var(--primary)' }} />
                )}
              </button>
            ))}
          </div>

          {currentSound !== 'none' && (
            <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--accent-light)' }}>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>
                🎧 Playing: {AMBIENT_SOUNDS.find(s => s.id === currentSound)?.name}
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
                Audio plays in Focus Mode
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Habit Selector Modal */}
      {showHabitSelector && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => setShowHabitSelector(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl p-6 shadow-xl"
            style={{ backgroundColor: 'var(--card)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-black mb-4">What are you working on?</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              <button
                onClick={() => startWithHabit(null)}
                className="w-full text-left p-3 rounded-xl border-2 transition-all"
                style={{ borderColor: 'var(--border)' }}
              >
                <span className="text-lg mr-2">⚡</span>
                <span className="font-medium">Just focus (no habit)</span>
              </button>
              {(habits as any[]).map((habit: any) => (
                <button
                  key={habit.id}
                  onClick={() => startWithHabit(habit.id)}
                  className="w-full text-left p-3 rounded-xl border-2 transition-all"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <span className="text-lg mr-2">{habit.icon || '📌'}</span>
                  <span className="font-medium">{habit.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={() => setShowSettings(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl p-6 shadow-xl"
            style={{ backgroundColor: 'var(--card)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black">Timer Settings</h3>
              <button onClick={() => setShowSettings(false)}>
                <X size={20} />
              </button>
            </div>

            {/* Focus Duration */}
            <div className="mb-6">
              <label className="block font-bold mb-3">Focus Duration</label>
              <div className="flex gap-2 mb-2">
                {FOCUS_DURATIONS.map(d => (
                  <button
                    key={d}
                    onClick={() => { setFocusDuration(d); setTimeLeft(d * 60); }}
                    className="flex-1 py-3 rounded-lg font-bold transition-all"
                    style={{
                      backgroundColor: focusDuration === d ? 'var(--primary)' : 'var(--border)',
                      color: focusDuration === d ? 'white' : 'var(--text)'
                    }}
                  >
                    {d}m
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm" style={{ color: 'var(--muted)' }}>Custom:</span>
                <input
                  type="number"
                  min="1"
                  max="180"
                  value={focusDuration}
                  onChange={(e) => {
                    const val = Math.max(1, Math.min(180, parseInt(e.target.value) || 1));
                    setFocusDuration(val);
                    if (sessionType === 'focus' && !isActive) setTimeLeft(val * 60);
                  }}
                  className="w-20 px-3 py-2 rounded-lg border text-center font-bold"
                  style={{ borderColor: 'var(--border)', backgroundColor: 'var(--accent-light)' }}
                />
                <span className="text-sm" style={{ color: 'var(--muted)' }}>minutes</span>
              </div>
            </div>

            {/* Break Duration */}
            <div className="mb-6">
              <label className="block font-bold mb-3">Break Duration</label>
              <div className="flex gap-2 mb-2">
                {BREAK_DURATIONS.map(d => (
                  <button
                    key={d}
                    onClick={() => setBreakDuration(d)}
                    className="flex-1 py-3 rounded-lg font-bold transition-all"
                    style={{
                      backgroundColor: breakDuration === d ? '#3b82f6' : 'var(--border)',
                      color: breakDuration === d ? 'white' : 'var(--text)'
                    }}
                  >
                    {d}m
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm" style={{ color: 'var(--muted)' }}>Custom:</span>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={breakDuration}
                  onChange={(e) => {
                    const val = Math.max(1, Math.min(60, parseInt(e.target.value) || 1));
                    setBreakDuration(val);
                  }}
                  className="w-20 px-3 py-2 rounded-lg border text-center font-bold"
                  style={{ borderColor: 'var(--border)', backgroundColor: 'var(--accent-light)' }}
                />
                <span className="text-sm" style={{ color: 'var(--muted)' }}>minutes</span>
              </div>
            </div>

            {/* Daily Goal */}
            <div className="mb-6">
              <label className="block font-bold mb-3">Daily Focus Goal</label>
              <div className="flex gap-2">
                {[2, 4, 6, 8].map(g => (
                  <button
                    key={g}
                    onClick={() => setDailyGoal(g)}
                    className="flex-1 py-3 rounded-lg font-bold transition-all"
                    style={{
                      backgroundColor: dailyGoal === g ? 'var(--primary)' : 'var(--border)',
                      color: dailyGoal === g ? 'white' : 'var(--text)'
                    }}
                  >
                    {g} sessions
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setShowSettings(false)}
              className="w-full py-3 rounded-lg font-bold transition-all active:scale-95"
              style={{ backgroundColor: 'var(--primary)', color: 'white' }}
            >
              Save Settings
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
