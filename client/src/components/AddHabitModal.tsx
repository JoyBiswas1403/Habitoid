import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { HABIT_CATEGORIES, FREQUENCY_OPTIONS, HABIT_TEMPLATES } from "@/lib/habitData";
import { ChevronLeft, ChevronRight, Package, X } from "lucide-react";

interface AddHabitModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AddHabitModal({ open, onClose }: AddHabitModalProps) {
  const [view, setView] = useState<'create' | 'templates'>('create');
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "other",
    color: "#50A65C",
    icon: "📌",
    frequency: "daily",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createHabitMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      await apiRequest("POST", "/api/habits", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/habits"] });
      toast({
        title: "Habit created! ⚡",
        description: `${formData.name} has been added to your habits`,
      });
      handleClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create habit. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleClose = () => {
    setFormData({
      name: "",
      description: "",
      category: "other",
      color: "#50A65C",
      icon: "📌",
      frequency: "daily",
    });
    setView('create');
    onClose();
  };

  const handleCategoryChange = (categoryId: string) => {
    const cat = HABIT_CATEGORIES.find(c => c.id === categoryId);
    if (cat) {
      setFormData(prev => ({
        ...prev,
        category: categoryId,
        color: cat.color,
        icon: cat.icon,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a habit name",
        variant: "destructive",
      });
      return;
    }
    createHabitMutation.mutate(formData);
  };

  const handleTemplateSelect = async (templateKey: string) => {
    const template = HABIT_TEMPLATES[templateKey as keyof typeof HABIT_TEMPLATES];
    if (!template) return;

    // Create all habits from template
    for (const habit of template.habits) {
      const cat = HABIT_CATEGORIES.find(c => c.id === habit.category);
      await apiRequest("POST", "/api/habits", {
        name: habit.name,
        icon: habit.icon,
        category: habit.category,
        color: cat?.color || "#50A65C",
        frequency: habit.frequency,
      });
    }

    queryClient.invalidateQueries({ queryKey: ["/api/habits"] });
    toast({
      title: "Template added! 🎉",
      description: `${template.habits.length} habits from "${template.name}" have been added`,
    });
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="sm:max-w-lg p-0 max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
      >
        {view === 'create' ? (
          <>
            {/* Header */}
            <div className="p-6 pb-0">
              <DialogHeader>
                <DialogTitle className="text-xl font-black">Create New Habit</DialogTitle>
              </DialogHeader>

              {/* Templates Button */}
              <button
                onClick={() => setView('templates')}
                className="mt-4 w-full flex items-center justify-between p-3 rounded-xl border-2 border-dashed transition-colors"
                style={{ borderColor: 'var(--border)' }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <div className="flex items-center gap-3">
                  <Package size={20} style={{ color: 'var(--primary)' }} />
                  <span className="font-bold text-sm">Browse Templates</span>
                </div>
                <ChevronRight size={16} style={{ color: 'var(--muted)' }} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-bold mb-2">Habit Name *</label>
                <input
                  placeholder="e.g., Morning Meditation"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 border-2 rounded-xl focus:outline-none transition-colors"
                  style={{
                    borderColor: 'var(--border)',
                    backgroundColor: 'var(--bg)',
                    color: 'var(--text)'
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                  onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                  data-testid="input-habit-name"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-bold mb-2">Category</label>
                <div className="grid grid-cols-4 gap-2">
                  {HABIT_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleCategoryChange(cat.id)}
                      className="flex flex-col items-center p-3 rounded-xl border-2 transition-all"
                      style={{
                        borderColor: formData.category === cat.id ? cat.color : 'var(--border)',
                        backgroundColor: formData.category === cat.id ? `${cat.color}15` : 'transparent'
                      }}
                    >
                      <span className="text-xl mb-1">{cat.icon}</span>
                      <span className="text-xs font-medium truncate w-full text-center" style={{ color: 'var(--muted)' }}>
                        {cat.label.split(' ')[0]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Frequency */}
              <div>
                <label className="block text-sm font-bold mb-2">Frequency</label>
                <div className="grid grid-cols-3 gap-2">
                  {FREQUENCY_OPTIONS.slice(0, 6).map((freq) => (
                    <button
                      key={freq.id}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, frequency: freq.id }))}
                      className="p-2 rounded-xl border-2 transition-all text-center"
                      style={{
                        borderColor: formData.frequency === freq.id ? 'var(--primary)' : 'var(--border)',
                        backgroundColor: formData.frequency === freq.id ? 'var(--accent-light)' : 'transparent'
                      }}
                    >
                      <span className="text-xs font-bold" style={{ color: formData.frequency === freq.id ? 'var(--primary)' : 'var(--text)' }}>
                        {freq.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-bold mb-2">Description (optional)</label>
                <textarea
                  rows={2}
                  placeholder="Brief description of your habit..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-2 border-2 rounded-xl focus:outline-none transition-colors resize-none"
                  style={{
                    borderColor: 'var(--border)',
                    backgroundColor: 'var(--bg)',
                    color: 'var(--text)'
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                  onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                  data-testid="input-habit-description"
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 rounded-lg font-bold border-2 transition-all active:scale-95"
                  style={{ borderColor: 'var(--border)' }}
                  data-testid="button-cancel-habit"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createHabitMutation.isPending}
                  className="px-6 py-2 rounded-lg font-bold transition-all active:scale-95 disabled:opacity-50"
                  style={{ backgroundColor: 'var(--primary)', color: 'white' }}
                  data-testid="button-create-habit"
                >
                  {createHabitMutation.isPending ? "Creating..." : "Create Habit"}
                </button>
              </div>
            </form>
          </>
        ) : (
          /* Templates View */
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => setView('create')}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <ChevronLeft size={20} />
              </button>
              <h2 className="text-xl font-black">Habit Templates</h2>
            </div>

            {/* Template List */}
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {Object.entries(HABIT_TEMPLATES).map(([key, template]) => (
                <button
                  key={key}
                  onClick={() => handleTemplateSelect(key)}
                  className="w-full text-left p-4 rounded-xl border-2 transition-all"
                  style={{ borderColor: 'var(--border)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--primary)';
                    e.currentTarget.style.backgroundColor = 'var(--accent-light)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold">{template.name}</h3>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-bold"
                      style={{ backgroundColor: 'var(--primary)', color: 'white' }}
                    >
                      {template.habits.length} habits
                    </span>
                  </div>
                  <p className="text-sm mb-3" style={{ color: 'var(--muted)' }}>
                    {template.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {template.habits.slice(0, 3).map((h, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-1 rounded-full"
                        style={{ backgroundColor: 'var(--accent-light)' }}
                      >
                        {h.icon} {h.name}
                      </span>
                    ))}
                    {template.habits.length > 3 && (
                      <span className="text-xs px-2 py-1" style={{ color: 'var(--muted)' }}>
                        +{template.habits.length - 3} more
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
