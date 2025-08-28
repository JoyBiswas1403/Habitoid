import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Brain, TrendingUp, Target, Lightbulb, RefreshCw, Download } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export default function Insights() {
  const [selectedWeek, setSelectedWeek] = useState(() => {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1);
    return monday.toISOString().split('T')[0];
  });

  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: insights, isLoading: insightsLoading } = useQuery({
    queryKey: ["/api/insights", selectedWeek],
    retry: false,
  });

  const generateInsightsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/insights/generate", {
        weekStart: selectedWeek,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/insights", selectedWeek] });
      toast({
        title: "Insights generated!",
        description: "Your personalized insights are ready to view.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate insights. Please try again.",
        variant: "destructive",
      });
    },
  });

  const downloadReportMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/reports/weekly/${selectedWeek}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to download report");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `weekly-report-${selectedWeek}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
    onSuccess: () => {
      toast({
        title: "Report downloaded!",
        description: "Your weekly report has been saved to your downloads.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to download report. Please try again.",
        variant: "destructive",
      });
    },
  });

  const { data: habits = [] } = useQuery({
    queryKey: ["/api/habits"],
  });

  // Get weeks for selection
  const getAvailableWeeks = () => {
    const weeks = [];
    const today = new Date();
    
    for (let i = 0; i < 8; i++) {
      const monday = new Date(today);
      monday.setDate(today.getDate() - today.getDay() + 1 - (i * 7));
      weeks.push({
        date: monday.toISOString().split('T')[0],
        label: i === 0 ? 'This Week' : i === 1 ? 'Last Week' : `${i} weeks ago`,
      });
    }
    
    return weeks;
  };

  const formatWeekRange = (weekStart: string) => {
    const start = new Date(weekStart);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    
    return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
  };

  const availableWeeks = getAvailableWeeks();

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">AI Insights</h1>
            <p className="text-muted-foreground">
              Get personalized productivity insights powered by AI
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
              className="text-sm bg-input border border-border rounded-md px-3 py-2 text-foreground"
              data-testid="select-week"
            >
              {availableWeeks.map(week => (
                <option key={week.date} value={week.date}>
                  {week.label}
                </option>
              ))}
            </select>
            <Button
              variant="outline"
              onClick={() => downloadReportMutation.mutate()}
              disabled={downloadReportMutation.isPending}
              data-testid="button-download-report"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Report
            </Button>
          </div>
        </div>

        {/* Week Info */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  Week of {formatWeekRange(selectedWeek)}
                </h3>
                <p className="text-muted-foreground">
                  {habits.length} active habits tracked
                </p>
              </div>
              <Button
                onClick={() => generateInsightsMutation.mutate()}
                disabled={generateInsightsMutation.isPending}
                data-testid="button-generate-insights"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${generateInsightsMutation.isPending ? 'animate-spin' : ''}`} />
                {insights ? 'Regenerate' : 'Generate'} Insights
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Insights Content */}
        {insightsLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-5/6" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-5/6" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          </div>
        ) : !insights ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No insights yet
                </h3>
                <p className="text-muted-foreground mb-6">
                  Generate AI-powered insights for this week's habit performance
                </p>
                <Button
                  onClick={() => generateInsightsMutation.mutate()}
                  disabled={generateInsightsMutation.isPending}
                  data-testid="button-generate-first-insights"
                >
                  <Brain className={`h-4 w-4 mr-2 ${generateInsightsMutation.isPending ? 'animate-spin' : ''}`} />
                  {generateInsightsMutation.isPending ? 'Generating...' : 'Generate Insights'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-chart-1" />
                  Performance Analysis
                </CardTitle>
                <CardDescription>
                  AI analysis of your weekly habits
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-foreground leading-relaxed" data-testid="text-insights-analysis">
                  {insights.insights}
                </p>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2 text-chart-2" />
                  Recommendations
                </CardTitle>
                <CardDescription>
                  Personalized suggestions for improvement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-foreground leading-relaxed" data-testid="text-insights-recommendations">
                  {insights.recommendations.split('\n').map((rec: string, index: number) => (
                    <p key={index} className="mb-2">
                      {rec}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Motivation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lightbulb className="h-5 w-5 mr-2 text-chart-3" />
                  Motivational Tip
                </CardTitle>
                <CardDescription>
                  Encouragement to keep you going
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-foreground leading-relaxed" data-testid="text-insights-motivation">
                  {insights.motivationalTip}
                </p>
                <div className="mt-4 pt-4 border-t border-border">
                  <Badge variant="secondary" className="text-xs">
                    Generated on {new Date(insights.createdAt).toLocaleDateString()}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* User Progress Summary */}
        {user && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Your Progress Overview</CardTitle>
              <CardDescription>
                Key metrics for your habit-building journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary" data-testid="stat-current-level">
                    Level {user.level || 1}
                  </div>
                  <div className="text-sm text-muted-foreground">Current Level</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent" data-testid="stat-total-points">
                    {user.totalPoints || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Points</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-success" data-testid="stat-current-streak">
                    {user.currentStreak || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Current Streak</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-chart-5" data-testid="stat-longest-streak">
                    {user.longestStreak || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Best Streak</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
