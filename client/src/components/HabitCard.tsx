import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Flame, Edit, Trash2 } from "lucide-react";
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
    return "bg-muted text-muted-foreground";
  };

  return (
    <div className="flex items-center justify-between p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          className={`w-6 h-6 rounded-full border-2 p-0 ${
            isCompleted
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-background"
          }`}
          onClick={() => toggleHabitMutation.mutate()}
          disabled={toggleHabitMutation.isPending}
          data-testid={`button-toggle-habit-${habit.id}`}
        >
          {isCompleted && <Check className="h-3 w-3" />}
        </Button>
        <div>
          <h4 className="font-medium text-foreground">{habit.name}</h4>
          <p className="text-sm text-muted-foreground">
            {habit.description || `${habit.category} • Daily`}
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <Badge className={getStreakColor(streak)} data-testid={`badge-streak-${habit.id}`}>
          <Flame className="h-3 w-3 mr-1" />
          {streak}
        </Badge>
        <div className="flex space-x-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
            data-testid={`button-edit-habit-${habit.id}`}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
            onClick={() => deleteHabitMutation.mutate()}
            disabled={deleteHabitMutation.isPending}
            data-testid={`button-delete-habit-${habit.id}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
