import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import HabitCard from "@/components/HabitCard";
import AddHabitModal from "@/components/AddHabitModal";

export default function Habits() {
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: habits = [] } = useQuery({
    queryKey: ["/api/habits"],
  });

  const { data: todayLogs = [] } = useQuery({
    queryKey: ["/api/habit-logs/today"],
  });

  // Filter habits based on search term
  const filteredHabits = habits.filter((habit: any) =>
    habit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    habit.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group habits by category
  const habitsByCategory = filteredHabits.reduce((acc: any, habit: any) => {
    if (!acc[habit.category]) {
      acc[habit.category] = [];
    }
    acc[habit.category].push(habit);
    return acc;
  }, {});

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Habits</h1>
            <p className="text-muted-foreground">
              Manage and track your daily habits
            </p>
          </div>
          <Button
            onClick={() => setShowAddHabit(true)}
            data-testid="button-add-habit"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Habit
          </Button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search habits..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="input-search-habits"
            />
          </div>
        </div>

        {/* Habits by Category */}
        {habits.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No habits yet
                </h3>
                <p className="text-muted-foreground mb-6">
                  Create your first habit to start building better routines
                </p>
                <Button
                  onClick={() => setShowAddHabit(true)}
                  data-testid="button-create-first-habit"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Habit
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : Object.keys(habitsByCategory).length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No habits found
                </h3>
                <p className="text-muted-foreground">
                  Try adjusting your search criteria
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(habitsByCategory).map(([category, categoryHabits]: [string, any]) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle>{category}</CardTitle>
                  <CardDescription>
                    {(categoryHabits as any[]).length} habit{(categoryHabits as any[]).length !== 1 ? 's' : ''}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(categoryHabits as any[]).map((habit: any) => {
                      const habitLog = todayLogs.find((log: any) => log.habitId === habit.id);
                      return (
                        <HabitCard
                          key={habit.id}
                          habit={habit}
                          isCompleted={habitLog?.completed || false}
                          streak={habit.currentStreak || 0}
                        />
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AddHabitModal
        open={showAddHabit}
        onClose={() => setShowAddHabit(false)}
      />
    </div>
  );
}
