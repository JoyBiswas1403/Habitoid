import {
  users,
  habits,
  habitLogs,
  pomodoroSessions,
  achievements,
  userAchievements,
  aiInsights,
  moodLogs,
  friendships,
  activityLogs,
  type User,
  type UpsertUser,
  type Habit,
  type InsertHabit,
  type HabitLog,
  type InsertHabitLog,
  type PomodoroSession,
  type InsertPomodoroSession,
  type Achievement,
  type UserAchievement,
  type AIInsight,
  type MoodLog,
  type InsertMoodLog,
  passwordResetTokens,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, desc, sql, or, ne } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Habit operations
  createHabit(habit: InsertHabit, userId: string): Promise<Habit>;
  getUserHabits(userId: string): Promise<Habit[]>;
  updateHabit(id: string, habit: Partial<InsertHabit>, userId: string): Promise<Habit | undefined>;
  deleteHabit(id: string, userId: string): Promise<boolean>;

  // Habit log operations
  logHabit(log: InsertHabitLog, userId: string): Promise<HabitLog>;
  getHabitLogs(habitId: string, startDate: string, endDate: string): Promise<HabitLog[]>;
  getUserHabitLogs(userId: string, date: string): Promise<HabitLog[]>;
  getHabitLogsForContribution(userId: string, startDate: string, endDate: string): Promise<HabitLog[]>;

  // Pomodoro operations
  createPomodoroSession(session: InsertPomodoroSession, userId: string): Promise<PomodoroSession>;
  getUserPomodoroSessions(userId: string, date: string): Promise<PomodoroSession[]>;

  // Achievement operations
  getAchievements(): Promise<Achievement[]>;
  getUserAchievements(userId: string): Promise<UserAchievement[]>;
  unlockAchievement(userId: string, achievementId: string): Promise<UserAchievement>;

  // AI Insights operations
  getWeeklyInsight(userId: string, weekStart: string): Promise<AIInsight | undefined>;
  saveWeeklyInsight(userId: string, weekStart: string, insights: string, recommendations: string, motivationalTip: string): Promise<AIInsight>;

  // Leaderboard operations
  getLeaderboard(): Promise<User[]>;
  updateUserStats(userId: string, points: number, currentStreak: number, longestStreak: number): Promise<void>;

  // Password Reset operations
  createPasswordResetToken(userId: string, token: string, expiresAt: Date): Promise<string>;
  getPasswordResetToken(token: string): Promise<{ userId: string; token: string; expiresAt: Date } | undefined>;
  deletePasswordResetToken(token: string): Promise<void>;

  // Mood operations
  logMood(mood: InsertMoodLog, userId: string): Promise<MoodLog>;
  getTodayMood(userId: string, date: string): Promise<MoodLog | undefined>;

  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  getUserByGithubId(githubId: string): Promise<User | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Habit operations
  async createHabit(habit: InsertHabit, userId: string): Promise<Habit> {
    const [newHabit] = await db
      .insert(habits)
      .values({ ...habit, userId })
      .returning();
    return newHabit;
  }

  async getUserHabits(userId: string): Promise<Habit[]> {
    return await db
      .select()
      .from(habits)
      .where(and(eq(habits.userId, userId), eq(habits.isActive, true))) // SQLite boolean is 1/0 but Drizzle handles it if schema is correct
      .orderBy(desc(habits.createdAt));
  }

  async updateHabit(id: string, habit: Partial<InsertHabit>, userId: string): Promise<Habit | undefined> {
    const [updatedHabit] = await db
      .update(habits)
      .set({ ...habit, updatedAt: new Date() })
      .where(and(eq(habits.id, id), eq(habits.userId, userId)))
      .returning();
    return updatedHabit;
  }

  async deleteHabit(id: string, userId: string): Promise<boolean> {
    const [updated] = await db
      .update(habits)
      .set({ isActive: false, updatedAt: new Date() })
      .where(and(eq(habits.id, id), eq(habits.userId, userId)))
      .returning();
    return !!updated;
  }

  // Habit log operations
  async logHabit(log: InsertHabitLog, userId: string): Promise<HabitLog> {
    const [newLog] = await db
      .insert(habitLogs)
      .values({ ...log, userId })
      .onConflictDoUpdate({
        target: [habitLogs.habitId, habitLogs.date],
        set: { completed: log.completed, value: log.value, notes: log.notes },
      })
      .returning();
    return newLog;
  }

  async getHabitLogs(habitId: string, startDate: string, endDate: string): Promise<HabitLog[]> {
    return await db
      .select()
      .from(habitLogs)
      .where(
        and(
          eq(habitLogs.habitId, habitId),
          gte(habitLogs.date, startDate),
          lte(habitLogs.date, endDate)
        )
      )
      .orderBy(desc(habitLogs.date));
  }

  async getUserHabitLogs(userId: string, date: string): Promise<HabitLog[]> {
    return await db
      .select()
      .from(habitLogs)
      .where(and(eq(habitLogs.userId, userId), eq(habitLogs.date, date)));
  }

  async getHabitLogsForContribution(userId: string, startDate: string, endDate: string): Promise<HabitLog[]> {
    return await db
      .select()
      .from(habitLogs)
      .where(
        and(
          eq(habitLogs.userId, userId),
          eq(habitLogs.completed, true),
          gte(habitLogs.date, startDate),
          lte(habitLogs.date, endDate)
        )
      )
      .orderBy(desc(habitLogs.date));
  }

  // Pomodoro operations
  async createPomodoroSession(session: InsertPomodoroSession, userId: string): Promise<PomodoroSession> {
    const [newSession] = await db
      .insert(pomodoroSessions)
      .values({ ...session, userId })
      .returning();
    return newSession;
  }

  async getUserPomodoroSessions(userId: string, date: string): Promise<PomodoroSession[]> {
    return await db
      .select()
      .from(pomodoroSessions)
      .where(and(eq(pomodoroSessions.userId, userId), eq(pomodoroSessions.date, date)))
      .orderBy(desc(pomodoroSessions.createdAt));
  }

  // Achievement operations
  async getAchievements(): Promise<Achievement[]> {
    return await db.select().from(achievements);
  }

  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    return await db
      .select()
      .from(userAchievements)
      .where(eq(userAchievements.userId, userId))
      .orderBy(desc(userAchievements.unlockedAt));
  }

  async unlockAchievement(userId: string, achievementId: string): Promise<UserAchievement> {
    const [achievement] = await db
      .insert(userAchievements)
      .values({ userId, achievementId })
      .returning();
    return achievement;
  }

  // AI Insights operations
  async getWeeklyInsight(userId: string, weekStart: string): Promise<AIInsight | undefined> {
    const [insight] = await db
      .select()
      .from(aiInsights)
      .where(and(eq(aiInsights.userId, userId), eq(aiInsights.weekStart, weekStart)));
    return insight;
  }

  async saveWeeklyInsight(
    userId: string,
    weekStart: string,
    insights: string,
    recommendations: string,
    motivationalTip: string
  ): Promise<AIInsight> {
    const [existing] = await db
      .select()
      .from(aiInsights)
      .where(and(eq(aiInsights.userId, userId), eq(aiInsights.weekStart, weekStart)));

    if (existing) {
      const [updated] = await db
        .update(aiInsights)
        .set({
          insights,
          recommendations,
          motivationalTip,
          createdAt: new Date(), // Update timestamp
        })
        .where(eq(aiInsights.id, existing.id))
        .returning();
      return updated;
    }

    const [insight] = await db
      .insert(aiInsights)
      .values({ userId, weekStart, insights, recommendations, motivationalTip })
      .returning();
    return insight;
  }

  // Leaderboard operations
  async getLeaderboard(): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .orderBy(desc(users.totalPoints), desc(users.currentStreak))
      .limit(50);
  }

  async updateUserStats(userId: string, points: number, currentStreak: number, longestStreak: number): Promise<void> {
    await db
      .update(users)
      .set({
        totalPoints: points,
        currentStreak,
        longestStreak: Math.max(longestStreak, currentStreak),
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  // Password Reset
  async createPasswordResetToken(userId: string, token: string, expiresAt: Date): Promise<string> {
    // Delete any existing tokens for this user
    await db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, userId));
    // Create new token
    await db.insert(passwordResetTokens).values({ token, userId, expiresAt });
    return token;
  }

  async getPasswordResetToken(token: string): Promise<{ userId: string; token: string; expiresAt: Date } | undefined> {
    const [resetToken] = await db
      .select()
      .from(passwordResetTokens)
      .where(eq(passwordResetTokens.token, token));
    return resetToken;
  }

  async deletePasswordResetToken(token: string): Promise<void> {
    await db.delete(passwordResetTokens).where(eq(passwordResetTokens.token, token));
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.googleId, googleId));
    return user;
  }

  async getUserByGithubId(githubId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.githubId, githubId));
    return user;
  }

  // Mood operations
  async logMood(mood: InsertMoodLog, userId: string): Promise<MoodLog> {
    // Upsert - update if exists for today, otherwise insert
    const existing = await this.getTodayMood(userId, mood.date);
    if (existing) {
      const [updated] = await db
        .update(moodLogs)
        .set({ mood: mood.mood, notes: mood.notes })
        .where(eq(moodLogs.id, existing.id))
        .returning();
      return updated;
    }
    const [newMood] = await db
      .insert(moodLogs)
      .values({ ...mood, userId })
      .returning();
    return newMood;
  }

  async getTodayMood(userId: string, date: string): Promise<MoodLog | undefined> {
    const [mood] = await db
      .select()
      .from(moodLogs)
      .where(and(eq(moodLogs.userId, userId), eq(moodLogs.date, date)));
    return mood;
  }

  // Friend operations
  async getFriends(userId: string): Promise<any[]> {
    // Get accepted friendships where user is either the requester or the friend
    const friendshipList = await db
      .select()
      .from(friendships)
      .where(
        and(
          or(eq(friendships.userId, userId), eq(friendships.friendId, userId)),
          eq(friendships.status, "accepted")
        )
      );

    // Get friend user details
    const friendIds = friendshipList.map(f =>
      f.userId === userId ? f.friendId : f.userId
    );

    if (friendIds.length === 0) return [];

    const friendUsers = await db
      .select({
        id: users.id,
        username: users.username,
        firstName: users.firstName,
        totalPoints: users.totalPoints,
        currentStreak: users.currentStreak,
        profileImageUrl: users.profileImageUrl,
      })
      .from(users)
      .where(sql`${users.id} IN ${friendIds}`);

    return friendUsers;
  }

  async addFriend(userId: string, friendUsername: string): Promise<{ success: boolean; message: string }> {
    // Find friend by username
    const friend = await this.getUserByUsername(friendUsername);
    if (!friend) {
      return { success: false, message: "User not found" };
    }
    if (friend.id === userId) {
      return { success: false, message: "Cannot add yourself as a friend" };
    }

    // Check if friendship already exists
    const [existing] = await db
      .select()
      .from(friendships)
      .where(
        or(
          and(eq(friendships.userId, userId), eq(friendships.friendId, friend.id)),
          and(eq(friendships.userId, friend.id), eq(friendships.friendId, userId))
        )
      );

    if (existing) {
      return { success: false, message: "Friend request already exists" };
    }

    // Create friend request
    await db.insert(friendships).values({
      userId,
      friendId: friend.id,
      status: "pending",
    });

    return { success: true, message: "Friend request sent" };
  }

  async removeFriend(userId: string, friendId: string): Promise<void> {
    await db
      .delete(friendships)
      .where(
        or(
          and(eq(friendships.userId, userId), eq(friendships.friendId, friendId)),
          and(eq(friendships.userId, friendId), eq(friendships.friendId, userId))
        )
      );
  }

  async getFriendRequests(userId: string): Promise<any[]> {
    // Get pending requests where user is the recipient (friendId)
    const requests = await db
      .select({
        id: friendships.id,
        userId: friendships.userId,
        createdAt: friendships.createdAt,
      })
      .from(friendships)
      .where(
        and(
          eq(friendships.friendId, userId),
          eq(friendships.status, "pending")
        )
      );

    // Get requester details
    const requestsWithUsers = await Promise.all(
      requests.map(async (req) => {
        const [requester] = await db
          .select({
            username: users.username,
            firstName: users.firstName,
            totalPoints: users.totalPoints,
          })
          .from(users)
          .where(eq(users.id, req.userId));
        return { ...req, requester };
      })
    );

    return requestsWithUsers;
  }

  async acceptFriendRequest(userId: string, requestId: string): Promise<void> {
    await db
      .update(friendships)
      .set({ status: "accepted" })
      .where(
        and(
          eq(friendships.id, requestId),
          eq(friendships.friendId, userId)
        )
      );
  }

  async rejectFriendRequest(userId: string, requestId: string): Promise<void> {
    await db
      .delete(friendships)
      .where(
        and(
          eq(friendships.id, requestId),
          eq(friendships.friendId, userId)
        )
      );
  }

  async getActivityFeed(userId: string): Promise<any[]> {
    // Get user's friends
    const friends = await this.getFriends(userId);
    const friendIds = friends.map(f => f.id);

    // Include user's own activities plus friends' activities
    const allUserIds = [userId, ...friendIds];

    if (allUserIds.length === 0) {
      return [];
    }

    const activities = await db
      .select({
        id: activityLogs.id,
        userId: activityLogs.userId,
        actionType: activityLogs.actionType,
        actionData: activityLogs.actionData,
        createdAt: activityLogs.createdAt,
      })
      .from(activityLogs)
      .where(sql`${activityLogs.userId} IN ${allUserIds}`)
      .orderBy(desc(activityLogs.createdAt))
      .limit(20);

    // Enrich with user data
    const activitiesWithUsers = await Promise.all(
      activities.map(async (act) => {
        const [user] = await db
          .select({ username: users.username, firstName: users.firstName })
          .from(users)
          .where(eq(users.id, act.userId));
        return { ...act, user };
      })
    );

    return activitiesWithUsers;
  }

  async getPublicProfile(userId: string): Promise<any> {
    const [user] = await db
      .select({
        id: users.id,
        username: users.username,
        firstName: users.firstName,
        totalPoints: users.totalPoints,
        currentStreak: users.currentStreak,
        longestStreak: users.longestStreak,
        level: users.level,
        profileImageUrl: users.profileImageUrl,
      })
      .from(users)
      .where(eq(users.id, userId));
    return user;
  }

  async logActivity(userId: string, actionType: string, actionData?: object): Promise<void> {
    await db.insert(activityLogs).values({
      userId,
      actionType,
      actionData: actionData ? JSON.stringify(actionData) : null,
    });
  }
}

export const storage = new DatabaseStorage();

