import { useState } from "react";
import { Check, Flame, Trash2, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { HABIT_CATEGORIES } from "@/lib/habitData";

interface HabitCardProps {
  habit: {
    id: string;
    name: string;
    description?: string;
    category: string;
    color?: string;
    icon?: string;
    frequency?: string;
  };
  isCompleted: boolean;
  streak?: number;
}

// Frequency labels
const frequencyLabels: Record<string, string> = {
  daily: 'Daily',
  weekdays: 'Weekdays',
  weekends: 'Weekends',
  weekly: 'Weekly',
  '3x_week': '3x/week',
  custom: 'Custom',
};

export default function HabitCard({ habit, isCompleted, streak = 0 }: HabitCardProps) {
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [note, setNote] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get category info
  const category = HABIT_CATEGORIES.find(c => c.id === habit.category) || HABIT_CATEGORIES[7]; // Default to 'other'
  const habitColor = habit.color || category.color;
  const habitIcon = habit.icon || category.icon;

  const toggleHabitMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/habits/${habit.id}/log`, {
        date: new Date().toISOString().split('T')[0],
        completed: !isCompleted,
        value: 1,
        notes: note || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/habit-logs/today"] });
      queryClient.invalidateQueries({ queryKey: ["/api/habits"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/habit-logs/contribution"] });
      toast({
        title: isCompleted ? "Habit unchecked" : "Habit completed! ⚡",
        description: isCompleted
          ? `Removed completion for ${habit.name}`
          : `Great job! You earned 10 points for completing ${habit.name}`,
      });
      setNote("");
      setShowNoteInput(false);
    },
  });

  const deleteHabitMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/habits/${habit.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/habits"] });
      toast({
        title: "Habit deleted",
        description: `${habit.name} has been removed`,
      });
    },
  });

  const handleComplete = () => {
    if (!isCompleted && !showNoteInput) {
      // Show note input option on first click
      toggleHabitMutation.mutate();
    } else {
      toggleHabitMutation.mutate();
    }
  };

  return (
    <div
      className="group flex items-center justify-between p-4 rounded-2xl transition-all border"
      style={{
        backgroundColor: 'var(--card)',
        borderColor: isCompleted ? habitColor : 'var(--border)',
        borderLeftWidth: '4px',
        borderLeftColor: habitColor,
      }}
    >
      <div className="flex items-center gap-4">
        {/* Category Icon */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
          style={{ backgroundColor: `${habitColor}20` }}
        >
          {habitIcon}
        </div>

        {/* Habit Info */}
        <div>
          <h4
            className="font-bold text-lg"
            style={{
              textDecoration: isCompleted ? 'line-through' : 'none',
              opacity: isCompleted ? 0.6 : 1
            }}
          >
            {habit.name}
          </h4>
          <div className="flex items-center gap-2 mt-1">
            {/* Category Badge */}
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{
                backgroundColor: `${habitColor}20`,
                color: habitColor
              }}
            >
              {category.label.split(' ')[0]}
            </span>

            {/* Frequency Badge */}
            <span
              className="text-xs font-medium"
              style={{ color: 'var(--muted)' }}
            >
              • {frequencyLabels[habit.frequency || 'daily']}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Streak */}
        {streak > 0 && (
          <div
            className="hidden sm:flex items-center gap-1 font-bold text-sm"
            style={{ color: '#f97316' }}
          >
            <Flame size={16} className="fill-current" />
            <span>{streak}</span>
          </div>
        )}

        {/* Note Button */}
        <button
          onClick={() => setShowNoteInput(!showNoteInput)}
          className="p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
          style={{ color: 'var(--muted)' }}
          title="Add note"
        >
          <MessageSquare size={16} />
        </button>

        {/* Delete Button */}
        <button
          onClick={() => deleteHabitMutation.mutate()}
          className="p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:text-red-500"
          style={{ color: 'var(--muted)' }}
        >
          <Trash2 size={16} />
        </button>

        {/* Complete Button */}
        <motion.button
          onClick={handleComplete}
          disabled={toggleHabitMutation.isPending}
          whileTap={{ scale: 0.9 }}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
          style={{
            backgroundColor: isCompleted ? habitColor : 'var(--accent-light)',
            color: isCompleted ? 'white' : 'var(--muted)'
          }}
        >
          {isCompleted ? (
            <Check size={20} />
          ) : (
            <div
              className="w-5 h-5 rounded-full border-2"
              style={{ borderColor: 'currentColor' }}
            />
          )}
        </motion.button>
      </div>

      {/* Note Input (hidden by default) */}
      {showNoteInput && !isCompleted && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="absolute bottom-0 left-0 right-0 p-4 bg-accent-light rounded-b-2xl"
        >
          <input
            type="text"
            placeholder="Add a note (optional)..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-sm border"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
          />
        </motion.div>
      )}
    </div>
  );
}
