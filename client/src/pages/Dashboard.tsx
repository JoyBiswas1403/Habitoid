import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Flame, Star, Clock, Percent, Plus, Smile, Frown, Meh } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import ContributionGrid from "@/components/ContributionGrid";
import PomodoroTimer from "@/components/PomodoroTimer";
import HabitCard from "@/components/HabitCard";
import AddHabitModal from "@/components/AddHabitModal";
import { useState } from "react";
import { motion } from "framer-motion";
import { pageVariants, listContainerVariants, listItemVariants, scaleHoverVariants } from "@/lib/animations";

export default function Dashboard() {
  const { user } = useAuth();
  const [showAddHabit, setShowAddHabit] = useState(false);

  // Fetch today's habits
  const { data: habits = [] } = useQuery({
    queryKey: ["/api/habits"],
  });

  const { data: todayLogs = [] } = useQuery({
    queryKey: ["/api/habit-logs/today"],
  });

  const { data: todayPomodoros = [] } = useQuery({
    queryKey: ["/api/pomodoro/today"],
  });

  // Calculate stats
  const completedToday = todayLogs.filter((log: any) => log.completed).length;
  const completionRate = habits.length > 0 ? Math.round((completedToday / habits.length) * 100) : 0;
  const focusTimeToday = todayPomodoros
    .filter((session: any) => session.completed && session.sessionType === 'focus')
    .reduce((total: number, session: any) => total + session.duration, 0);

  const focusHours = Math.floor(focusTimeToday / 60);
  const focusMinutes = focusTimeToday % 60;

  return (
    <motion.div
      className="py-8 bg-background min-h-full"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header Section */}
        <div className="flex items-center justify-between mb-8 relative">
          <div className="z-10">
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Hi, {user?.firstName || user?.username}</h1>
            <p className="text-muted-foreground mt-1">Great, your daily plan is almost done!</p>
          </div>

          <div className="absolute right-0 top-0 -mt-8 -mr-8 w-48 h-48 opacity-20 pointer-events-none">
            <div className="w-full h-full bg-gradient-to-br from-orange-200 to-yellow-200 rounded-full blur-3xl" />
          </div>

          <motion.div
            className="relative w-24 h-24 flex items-center justify-center"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          >
            {/* Hero Image with Progress Ring */}
            <div className="absolute inset-0 p-2">
              <img src="/assets/dashboard-hero.png" alt="Hero" className="w-full h-full object-contain" />
            </div>

            <svg className="w-full h-full transform -rotate-90 absolute inset-0">
              <circle
                cx="48"
                cy="48"
                r="44"
                stroke="currentColor"
                strokeWidth="4"
                fill="transparent"
                className="text-secondary"
              />
              <circle
                cx="48"
                cy="48"
                r="44"
                stroke="currentColor"
                strokeWidth="4"
                fill="transparent"
                strokeDasharray={276}
                strokeDashoffset={276 - (276 * completionRate) / 100}
                className="text-primary transition-all duration-1000 ease-out"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute -bottom-2 bg-background/80 backdrop-blur-sm px-2 py-0.5 rounded-full shadow-sm border border-border/50">
              <span className="text-xs font-bold text-foreground">{completionRate}%</span>
            </div>
          </motion.div>
        </div>

        {/* Stats Row - Soft Cards */}
        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10"
          variants={listContainerVariants}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={listItemVariants} whileHover="hover" whileTap="tap" custom={scaleHoverVariants}>
            <div className="bg-card rounded-3xl p-5 shadow-soft flex flex-col items-center justify-center text-center h-full relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-orange-500/10 rounded-full -mr-8 -mt-8" />
              <div className="w-16 h-16 mb-2">
                <img src="/assets/streak-fire.png" alt="Streak" className="w-full h-full object-contain drop-shadow-md" />
              </div>
              <div className="text-2xl font-bold text-foreground">{user?.currentStreak || 0}</div>
              <div className="text-xs font-medium text-muted-foreground">Day Streak</div>
            </div>
          </motion.div>

          <motion.div variants={listItemVariants} whileHover="hover" whileTap="tap" custom={scaleHoverVariants}>
            <div className="bg-card rounded-3xl p-5 shadow-soft flex flex-col items-center justify-center text-center h-full relative overflow-hidden">
              <div className="absolute top-0 left-0 w-16 h-16 bg-yellow-500/10 rounded-full -ml-8 -mt-8" />
              <div className="w-16 h-16 mb-2">
                <img src="/assets/trophy.png" alt="Trophy" className="w-full h-full object-contain drop-shadow-md" />
              </div>
              <div className="text-2xl font-bold text-foreground">{user?.totalPoints || 0}</div>
              <div className="text-xs font-medium text-muted-foreground">Total Points</div>
            </div>
          </motion.div>

          <motion.div variants={listItemVariants} whileHover="hover" whileTap="tap" custom={scaleHoverVariants}>
            <div className="bg-card rounded-3xl p-5 shadow-soft flex flex-col items-center justify-center text-center h-full">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                <Clock className="h-5 w-5 text-blue-500" />
              </div>
              <div className="text-2xl font-bold text-foreground">{focusHours}h {focusMinutes}m</div>
              <div className="text-xs font-medium text-muted-foreground">Focus Time</div>
            </div>
          </motion.div>

          <motion.div variants={listItemVariants} whileHover="hover" whileTap="tap" custom={scaleHoverVariants}>
            <div className="bg-card rounded-3xl p-5 shadow-soft flex flex-col items-center justify-center text-center h-full">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-3">
                <Percent className="h-5 w-5 text-green-500" />
              </div>
              <div className="text-2xl font-bold text-foreground">{completionRate}%</div>
              <div className="text-xs font-medium text-muted-foreground">Completion</div>
            </div>
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Plan for the day (Habits) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">Plan for the day</h2>
              <Button
                onClick={() => setShowAddHabit(true)}
                className="rounded-full px-6 bg-foreground text-background hover:bg-foreground/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Habit
              </Button>
            </div>

            <motion.div
              className="space-y-4"
              variants={listContainerVariants}
              initial="hidden"
              animate="show"
            >
              {habits.length === 0 ? (
                <div className="bg-card rounded-3xl p-8 text-center shadow-soft">
                  <p className="text-muted-foreground mb-4">No habits yet. Start your journey today!</p>
                </div>
              ) : (
                habits.map((habit: any) => {
                  const habitLog = todayLogs.find((log: any) => log.habitId === habit.id);
                  return (
                    <motion.div key={habit.id} variants={listItemVariants}>
                      <HabitCard
                        habit={habit}
                        isCompleted={habitLog?.completed || false}
                        streak={habit.currentStreak || 0}
                      />
                    </motion.div>
                  );
                })
              )}
            </motion.div>
          </div>

          {/* Right Column: Timer & Activity */}
          <div className="space-y-6">
            {/* Mood Tracker Card */}
            <motion.div
              className="bg-card rounded-[2rem] p-6 shadow-soft"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <h3 className="text-lg font-bold mb-4">How are you feeling?</h3>
              <div className="flex justify-between items-center">
                <button className="flex flex-col items-center space-y-2 group">
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center group-hover:bg-red-200 transition-colors">
                    <Frown className="h-6 w-6 text-red-500" />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">Bad</span>
                </button>
                <button className="flex flex-col items-center space-y-2 group">
                  <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center group-hover:bg-yellow-200 transition-colors">
                    <Meh className="h-6 w-6 text-yellow-500" />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">Okay</span>
                </button>
                <button className="flex flex-col items-center space-y-2 group">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors">
                    <Smile className="h-6 w-6 text-green-500" />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">Good</span>
                </button>
              </div>
            </motion.div>

            <div className="bg-card rounded-[2rem] p-6 shadow-soft">
              <h3 className="text-lg font-bold mb-4">Focus Timer</h3>
              <PomodoroTimer />
            </div>

            <div className="bg-card rounded-[2rem] p-6 shadow-soft">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Activity</h3>
                <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">Yearly</span>
              </div>
              <ContributionGrid />
            </div>
          </div>
        </div>
      </div>

      <AddHabitModal
        open={showAddHabit}
        onClose={() => setShowAddHabit(false)}
      />
    </motion.div>
  );
}
