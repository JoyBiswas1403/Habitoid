import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Medal, Award, Crown, Flame, Star } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { pageVariants, listContainerVariants, listItemVariants } from "@/lib/animations";

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
        return <Crown className="h-6 w-6 text-yellow-500 fill-yellow-500" />;
      case 2:
        return <Trophy className="h-6 w-6 text-gray-400 fill-gray-400" />;
      case 3:
        return <Medal className="h-6 w-6 text-amber-600 fill-amber-600" />;
      default:
        return <span className="text-lg font-bold text-muted-foreground w-6 text-center">{position}</span>;
    }
  };

  const getUserInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || '??';
  };

  const getAvatarUrl = (username: string) => {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;
  };

  const userPosition = leaderboard.findIndex((leader: any) => leader.id === user?.id) + 1;

  // Get recent achievements
  const recentAchievements = userAchievements
    .sort((a: any, b: any) => new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime())
    .slice(0, 3);

  return (
    <motion.div
      className="py-8 bg-background min-h-full"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Leaderboard</h1>
            <p className="text-muted-foreground mt-1">
              See how you rank among other habit builders
            </p>
          </div>
          <div className="bg-card rounded-2xl px-4 py-2 shadow-soft flex items-center space-x-2">
            <span className="text-sm font-medium text-muted-foreground">Your Rank:</span>
            <span className="text-lg font-bold text-primary">#{userPosition > 0 ? userPosition : '-'}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Leaderboard List */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-[2.5rem] p-6 shadow-soft min-h-[500px]">
              <div className="flex items-center justify-between mb-6 px-2">
                <h2 className="text-xl font-bold">Top Performers</h2>
                <div className="flex space-x-2">
                  <Badge variant="secondary" className="rounded-full px-3">This Week</Badge>
                  <Badge variant="outline" className="rounded-full px-3 border-transparent hover:bg-secondary">All Time</Badge>
                </div>
              </div>

              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="flex items-center space-x-4 p-4 animate-pulse">
                      <div className="w-8 h-8 bg-secondary rounded-full" />
                      <div className="w-12 h-12 bg-secondary rounded-full" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-secondary rounded w-32" />
                        <div className="h-3 bg-secondary rounded w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : leaderboard.length === 0 ? (
                <div className="text-center py-12">
                  <Trophy className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No rankings available yet. Start building habits!
                  </p>
                </div>
              ) : (
                <motion.div
                  className="space-y-3"
                  variants={listContainerVariants}
                  initial="hidden"
                  animate="show"
                >
                  {leaderboard.map((leader: any, index: number) => {
                    const position = index + 1;
                    const isCurrentUser = leader.id === user?.id;

                    return (
                      <motion.div
                        key={leader.id}
                        variants={listItemVariants}
                        className={cn(
                          "group flex items-center space-x-4 p-4 rounded-3xl transition-all duration-300",
                          isCurrentUser
                            ? "bg-primary text-primary-foreground shadow-lg scale-[1.02]"
                            : "bg-background hover:bg-secondary/50 hover:shadow-md border border-transparent hover:border-secondary"
                        )}
                        data-testid={`leaderboard-rank-${position}`}
                      >
                        <div className="flex-shrink-0 w-8 flex justify-center font-bold">
                          {getRankIcon(position)}
                        </div>

                        <Avatar className={cn("h-12 w-12 border-2", isCurrentUser ? "border-white/20" : "border-background shadow-sm")}>
                          <AvatarImage src={getAvatarUrl(leader.username)} alt={leader.username} />
                          <AvatarFallback className={cn(
                            "font-bold",
                            isCurrentUser ? "bg-white/20 text-white" : "bg-gradient-to-br from-orange-100 to-yellow-100 text-orange-600"
                          )}>
                            {getUserInitials(leader.firstName, leader.lastName)}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                          <h3 className={cn(
                            "font-bold text-lg",
                            isCurrentUser ? "text-white" : "text-foreground"
                          )}>
                            {leader.firstName} {leader.lastName}
                            {isCurrentUser && " (You)"}
                          </h3>
                          <div className={cn(
                            "flex items-center text-sm",
                            isCurrentUser ? "text-white/80" : "text-muted-foreground"
                          )}>
                            <span className="mr-3">Level {leader.level || 1}</span>
                            <span className="flex items-center">
                              <Flame className={cn("h-3 w-3 mr-1", isCurrentUser ? "text-white" : "text-orange-500")} />
                              {leader.currentStreak || 0} streak
                            </span>
                          </div>
                        </div>

                        <div className={cn(
                          "font-bold text-xl",
                          isCurrentUser ? "text-white" : "text-primary"
                        )}>
                          {leader.totalPoints || 0}
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </div>
          </div>

          {/* Sidebar Stats */}
          <div className="space-y-6">
            {/* Your Stats Summary */}
            <div className="bg-card rounded-[2.5rem] p-8 shadow-soft text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-10 -mt-10" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-yellow-500/5 rounded-full -ml-8 -mb-8" />

              <Avatar className="h-20 w-20 mx-auto mb-4 border-4 border-background shadow-lg">
                <AvatarImage src={getAvatarUrl(user?.username || '')} alt={user?.username} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-yellow-400 text-white text-2xl font-bold">
                  {getUserInitials(user?.firstName, user?.lastName)}
                </AvatarFallback>
              </Avatar>

              <h3 className="text-xl font-bold text-foreground">{user?.firstName} {user?.lastName}</h3>
              <p className="text-muted-foreground mb-6">Level {user?.level || 1} Habit Builder</p>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-secondary/50 rounded-2xl p-3">
                  <div className="text-2xl font-bold text-primary">{user?.totalPoints || 0}</div>
                  <div className="text-xs text-muted-foreground font-medium">Points</div>
                </div>
                <div className="bg-secondary/50 rounded-2xl p-3">
                  <div className="text-2xl font-bold text-orange-500">{user?.currentStreak || 0}</div>
                  <div className="text-xs text-muted-foreground font-medium">Streak</div>
                </div>
              </div>
            </div>

            {/* Recent Achievements */}
            <div className="bg-card rounded-[2.5rem] p-6 shadow-soft">
              <h3 className="text-lg font-bold mb-4 flex items-center">
                <Award className="h-5 w-5 mr-2 text-yellow-500" />
                Recent Awards
              </h3>

              <div className="space-y-4">
                {recentAchievements.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No achievements yet.
                  </p>
                ) : (
                  recentAchievements.map((userAchievement: any) => {
                    const achievement = achievements.find((a: any) => a.id === userAchievement.achievementId);
                    if (!achievement) return null;

                    return (
                      <div
                        key={userAchievement.id}
                        className="flex items-center space-x-3"
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-2xl flex items-center justify-center text-2xl shadow-sm p-2">
                          <img src="/assets/trophy.png" alt="Trophy" className="w-full h-full object-contain" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-foreground text-sm">
                            {achievement.name}
                          </h4>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {achievement.description}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
