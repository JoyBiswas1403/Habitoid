import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, Medal, Award, Crown, Flame, Star } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

export default function Leaderboard() {
  const { user } = useAuth();

  const { data: leaderboard = [], isLoading } = useQuery({
    queryKey: ["/api/leaderboard"],
  });

  const { data: userAchievements = [] } = useQuery({
    queryKey: ["/api/user-achievements"],
  });

  const { data: achievements = [] } = useQuery({
    queryKey: ["/api/achievements"],
  });

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Trophy className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Medal className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-muted-foreground">#{position}</span>;
    }
  };

  const getRankBadgeColor = (position: number) => {
    if (position === 1) return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white";
    if (position === 2) return "bg-gradient-to-r from-gray-300 to-gray-500 text-white";
    if (position === 3) return "bg-gradient-to-r from-amber-400 to-amber-600 text-white";
    return "bg-muted text-muted-foreground";
  };

  const getUserInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || '??';
  };

  const userPosition = leaderboard.findIndex((leader: any) => leader.id === user?.id) + 1;

  // Get recent achievements
  const recentAchievements = userAchievements
    .sort((a: any, b: any) => new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime())
    .slice(0, 3);

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Leaderboard</h1>
          <p className="text-muted-foreground">
            See how you rank among other habit builders
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Leaderboard */}
          <div className="lg:col-span-2 space-y-4">
            {/* Your Rank Card */}
            {user && userPosition > 0 && (
              <Card className="border-primary/50 bg-primary/5">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <Trophy className="h-5 w-5 mr-2 text-primary" />
                      Your Rank
                    </CardTitle>
                    <Badge className={getRankBadgeColor(userPosition)}>
                      #{userPosition}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getUserInitials(user.firstName, user.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">
                        {user.firstName} {user.lastName}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 mr-1 text-accent" />
                          {user.totalPoints || 0} points
                        </div>
                        <div className="flex items-center">
                          <Flame className="h-4 w-4 mr-1 text-primary" />
                          {user.currentStreak || 0} day streak
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline">Level {user.level || 1}</Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Top Rankings */}
            <Card>
              <CardHeader>
                <CardTitle>Top Performers</CardTitle>
                <CardDescription>
                  The most consistent habit builders this month
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="flex items-center space-x-4 p-3 animate-pulse">
                        <div className="w-8 h-8 bg-muted rounded-full" />
                        <div className="w-12 h-12 bg-muted rounded-full" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-muted rounded w-32" />
                          <div className="h-3 bg-muted rounded w-24" />
                        </div>
                        <div className="h-6 bg-muted rounded w-16" />
                      </div>
                    ))}
                  </div>
                ) : leaderboard.length === 0 ? (
                  <div className="text-center py-8">
                    <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No rankings available yet. Start building habits to see the leaderboard!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {leaderboard.map((leader: any, index: number) => {
                      const position = index + 1;
                      const isCurrentUser = leader.id === user?.id;
                      
                      return (
                        <div
                          key={leader.id}
                          className={cn(
                            "flex items-center space-x-4 p-3 rounded-lg transition-colors",
                            isCurrentUser ? "bg-primary/10 border border-primary/20" : "hover:bg-muted/50",
                            position <= 3 && "bg-gradient-to-r from-transparent to-muted/30"
                          )}
                          data-testid={`leaderboard-rank-${position}`}
                        >
                          <div className="flex-shrink-0 w-8 flex justify-center">
                            {getRankIcon(position)}
                          </div>
                          
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className={cn(
                              position === 1 ? "bg-yellow-500 text-white" :
                              position === 2 ? "bg-gray-400 text-white" :
                              position === 3 ? "bg-amber-500 text-white" :
                              "bg-muted text-muted-foreground"
                            )}>
                              {getUserInitials(leader.firstName, leader.lastName)}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1">
                            <h3 className={cn(
                              "font-semibold",
                              isCurrentUser ? "text-primary" : "text-foreground"
                            )}>
                              {leader.firstName} {leader.lastName}
                              {isCurrentUser && " (You)"}
                            </h3>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <div className="flex items-center">
                                <Star className="h-4 w-4 mr-1 text-accent" />
                                {leader.totalPoints || 0}
                              </div>
                              <div className="flex items-center">
                                <Flame className="h-4 w-4 mr-1 text-primary" />
                                {leader.currentStreak || 0}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">Level {leader.level || 1}</Badge>
                            {position <= 3 && (
                              <Badge className={getRankBadgeColor(position)}>
                                Top {position}
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="h-5 w-5 mr-2" />
                  Recent Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentAchievements.length === 0 ? (
                  <div className="text-center py-6">
                    <Award className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No achievements yet. Keep building habits to unlock rewards!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentAchievements.map((userAchievement: any) => {
                      const achievement = achievements.find((a: any) => a.id === userAchievement.achievementId);
                      if (!achievement) return null;
                      
                      return (
                        <div
                          key={userAchievement.id}
                          className="flex items-center space-x-3 p-3 bg-muted rounded-lg"
                          data-testid={`achievement-${achievement.id}`}
                        >
                          <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
                            <i className={`fas ${achievement.icon} text-accent-foreground`} />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-foreground text-sm">
                              {achievement.name}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              {achievement.description}
                            </p>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            +{achievement.points}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Competition Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Competition Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Players</span>
                  <span className="font-semibold" data-testid="stat-total-players">
                    {leaderboard.length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Your Rank</span>
                  <span className="font-semibold" data-testid="stat-your-rank">
                    {userPosition > 0 ? `#${userPosition}` : 'Not ranked'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Top 10%</span>
                  <span className="font-semibold">
                    {userPosition > 0 && userPosition <= Math.ceil(leaderboard.length * 0.1) ? (
                      <Badge className="bg-success text-white">Yes</Badge>
                    ) : (
                      <Badge variant="outline">No</Badge>
                    )}
                  </span>
                </div>
                {user && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Your Level</span>
                    <Badge variant="outline">Level {user.level || 1}</Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Ranking Tiers */}
            <Card>
              <CardHeader>
                <CardTitle>Ranking Tiers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Crown className="h-4 w-4 text-yellow-500" />
                      <span>Champion</span>
                    </div>
                    <span className="text-muted-foreground">#1</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Trophy className="h-4 w-4 text-gray-400" />
                      <span>Runner-up</span>
                    </div>
                    <span className="text-muted-foreground">#2</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Medal className="h-4 w-4 text-amber-600" />
                      <span>Third Place</span>
                    </div>
                    <span className="text-muted-foreground">#3</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Star className="h-4 w-4 text-primary" />
                      <span>Top 10</span>
                    </div>
                    <span className="text-muted-foreground">#4-10</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
