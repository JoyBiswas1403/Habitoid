import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Flame, Edit, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface HabitCardProps {
  habit: {
    id: string;
    name: string;
    description?: string;
    category: string;
  };
  isCompleted: boolean;
  streak: number;
}

export default function HabitCard({ habit, isCompleted, streak }: HabitCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const toggleHabitMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/habits/${habit.id}/log`, {
        date: new Date().toISOString().split('T')[0],
        completed: !isCompleted,
        value: 1,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/habit-logs/today"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: isCompleted ? "Habit unchecked" : "Habit completed!",
        description: isCompleted
          ? `Removed completion for ${habit.name}`
          : `Great job! You earned 10 points for completing ${habit.name}`,
      });
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
        description: `${habit.name} has been removed from your habits`,
      });
    },
  });

  const getStreakColor = (streak: number) => {
    if (streak >= 21) return "bg-success text-white";
    if (streak >= 7) return "bg-warning text-white";
    if (streak >= 3) return "bg-chart-3 text-white";
    return "bg-secondary text-muted-foreground";
  };

  // Icon mapping based on category (simplified)
  const getIcon = () => {
    // In a real app, this would be dynamic or passed as a prop
    return <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
      <div className="w-2 h-2 bg-current rounded-full" />
    </div>;
  };

  return (
    <div className="group flex items-center justify-between p-4 bg-card rounded-3xl shadow-card hover:shadow-soft transition-all duration-300 border border-transparent hover:border-primary/10">
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0">
          {/* Placeholder for category icon */}
          <div className="w-12 h-12 rounded-2xl bg-secondary/50 flex items-center justify-center text-primary">
            <span className="text-xl">💧</span>
          </div>
        </div>
        <div>
          <h4 className="font-bold text-foreground text-lg">{habit.name}</h4>
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-xs font-medium text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
              {habit.category}
            </span>
            <span className="text-xs text-muted-foreground">• Daily</span>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {streak > 0 && (
          <div className="hidden sm:flex items-center space-x-1 text-orange-500 font-bold text-sm">
            <Flame className="h-4 w-4 fill-current" />
            <span>{streak}</span>
          </div>
        )}

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
            onClick={() => deleteHabitMutation.mutate()}
          >
            <Trash2 className="h-4 w-4" />
          </Button>

          <motion.button
            onClick={() => toggleHabitMutation.mutate()}
            disabled={toggleHabitMutation.isPending}
            whileTap={{ scale: 0.9 }}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isCompleted
              ? "bg-success text-white shadow-lg scale-110"
              : "bg-secondary text-muted-foreground hover:bg-primary/20 hover:text-primary"
              }`}
          >
            {isCompleted ? <Check className="h-6 w-6" /> : <div className="w-4 h-4 rounded-full border-2 border-current" />}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
