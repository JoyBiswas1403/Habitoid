import {
  users,
  habits,
  habitLogs,
  pomodoroSessions,
  achievements,
  userAchievements,
  aiInsights,
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
  passwordResetTokens,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, desc, sql } from "drizzle-orm";

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
  createPasswordResetToken(userId: string): Promise<string>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  getUserByGithubId(githubId: string): Promise<User | undefined>;
  getUserByFacebookId(facebookId: string): Promise<User | undefined>;
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
      .where(and(eq(habits.userId, userId), eq(habits.isActive, true)))
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
  async createPasswordResetToken(userId: string): Promise<string> {
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour
    await db.insert(passwordResetTokens).values({ token, userId, expiresAt });
    return token;
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

  async getUserByFacebookId(facebookId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.facebookId, facebookId));
    return user;
  }
}

export const storage = new DatabaseStorage();
