import { relations, sql } from "drizzle-orm";
import {
  sqliteTable,
  text,
  integer,
  real,
} from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User storage table
export const users = sqliteTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  username: text("username").unique().notNull(),
  password: text("password"),
  email: text("email").unique(),
  googleId: text("google_id").unique(),
  githubId: text("github_id").unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  profileImageUrl: text("profile_image_url"),
  level: integer("level").default(1),
  totalPoints: integer("total_points").default(0),
  currentStreak: integer("current_streak").default(0),
  longestStreak: integer("longest_streak").default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch() * 1000)`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(unixepoch() * 1000)`),
});

export const passwordResetTokens = sqliteTable("password_reset_tokens", {
  token: text("token").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
});

export const habits = sqliteTable("habits", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull().default("other"),
  color: text("color").default("#50A65C"), // Category color
  icon: text("icon").default("📌"), // Category icon
  frequency: text("frequency").notNull().default("daily"), // daily, weekdays, weekends, weekly, custom
  frequencyConfig: text("frequency_config"), // JSON: {days: [0,1,2,3,4,5,6], timesPerWeek: 3}
  targetValue: integer("target_value").default(1),
  unit: text("unit").default("times"),
  reminderTime: text("reminder_time"), // HH:MM format for notifications
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch() * 1000)`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(unixepoch() * 1000)`),
});


export const habitLogs = sqliteTable("habit_logs", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  habitId: text("habit_id").notNull().references(() => habits.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  date: text("date").notNull(), // ISO string YYYY-MM-DD
  completed: integer("completed", { mode: "boolean" }).default(false),
  value: integer("value").default(1),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch() * 1000)`),
});

export const pomodoroSessions = sqliteTable("pomodoro_sessions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  duration: integer("duration").notNull(), // in minutes
  completed: integer("completed", { mode: "boolean" }).default(false),
  sessionType: text("session_type").default("focus"), // focus, short_break, long_break
  date: text("date").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch() * 1000)`),
});

export const achievements = sqliteTable("achievements", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  type: text("type").notNull(), // streak, habit_count, points, pomodoro
  requirement: integer("requirement").notNull(),
  points: integer("points").notNull(),
});

export const userAchievements = sqliteTable("user_achievements", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  achievementId: text("achievement_id").notNull().references(() => achievements.id, { onDelete: "cascade" }),
  unlockedAt: integer("unlocked_at", { mode: "timestamp" }).default(sql`(unixepoch() * 1000)`),
});

export const aiInsights = sqliteTable("ai_insights", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  weekStart: text("week_start").notNull(),
  insights: text("insights").notNull(),
  recommendations: text("recommendations").notNull(),
  motivationalTip: text("motivational_tip").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch() * 1000)`),
});

// Mood tracking table
export const moodLogs = sqliteTable("mood_logs", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  date: text("date").notNull(), // ISO string YYYY-MM-DD
  mood: integer("mood").notNull(), // 1 = sad, 2 = neutral, 3 = happy
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch() * 1000)`),
});

// Friendships table for friend relationships
export const friendships = sqliteTable("friendships", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  friendId: text("friend_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("pending"), // pending, accepted, rejected
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch() * 1000)`),
});

// Activity logs for social feed
export const activityLogs = sqliteTable("activity_logs", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  actionType: text("action_type").notNull(), // habit_complete, streak_milestone, badge_unlock, focus_session, level_up
  actionData: text("action_data"), // JSON with details
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch() * 1000)`),
});


// Relations
export const usersRelations = relations(users, ({ many }) => ({
  habits: many(habits),
  habitLogs: many(habitLogs),
  pomodoroSessions: many(pomodoroSessions),
  userAchievements: many(userAchievements),
  aiInsights: many(aiInsights),
  moodLogs: many(moodLogs),
  friendships: many(friendships),
  activityLogs: many(activityLogs),
}));

export const habitsRelations = relations(habits, ({ one, many }) => ({
  user: one(users, {
    fields: [habits.userId],
    references: [users.id],
  }),
  logs: many(habitLogs),
}));

export const habitLogsRelations = relations(habitLogs, ({ one }) => ({
  habit: one(habits, {
    fields: [habitLogs.habitId],
    references: [habits.id],
  }),
  user: one(users, {
    fields: [habitLogs.userId],
    references: [users.id],
  }),
}));

export const pomodoroSessionsRelations = relations(pomodoroSessions, ({ one }) => ({
  user: one(users, {
    fields: [pomodoroSessions.userId],
    references: [users.id],
  }),
}));

export const achievementsRelations = relations(achievements, ({ many }) => ({
  userAchievements: many(userAchievements),
}));

export const userAchievementsRelations = relations(userAchievements, ({ one }) => ({
  user: one(users, {
    fields: [userAchievements.userId],
    references: [users.id],
  }),
  achievement: one(achievements, {
    fields: [userAchievements.achievementId],
    references: [achievements.id],
  }),
}));

export const aiInsightsRelations = relations(aiInsights, ({ one }) => ({
  user: one(users, {
    fields: [aiInsights.userId],
    references: [users.id],
  }),
}));

export const moodLogsRelations = relations(moodLogs, ({ one }) => ({
  user: one(users, {
    fields: [moodLogs.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertHabitSchema = createInsertSchema(habits).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertHabitLogSchema = createInsertSchema(habitLogs).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const insertPomodoroSessionSchema = createInsertSchema(pomodoroSessions).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const insertMoodLogSchema = createInsertSchema(moodLogs).omit({
  id: true,
  userId: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertHabit = z.infer<typeof insertHabitSchema>;
export type Habit = typeof habits.$inferSelect;
export type InsertHabitLog = z.infer<typeof insertHabitLogSchema>;
export type HabitLog = typeof habitLogs.$inferSelect;
export type InsertPomodoroSession = z.infer<typeof insertPomodoroSessionSchema>;
export type PomodoroSession = typeof pomodoroSessions.$inferSelect;
export type Achievement = typeof achievements.$inferSelect;
export type UserAchievement = typeof userAchievements.$inferSelect;
export type AIInsight = typeof aiInsights.$inferSelect;
export type InsertMoodLog = z.infer<typeof insertMoodLogSchema>;
export type MoodLog = typeof moodLogs.$inferSelect;
