import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertHabitSchema, insertHabitLogSchema, insertPomodoroSessionSchema } from "@shared/schema";
import { generateWeeklyInsights } from "./services/openai";
import { generateWeeklyReport } from "./services/pdf";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Habit routes
  app.get('/api/habits', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const habits = await storage.getUserHabits(userId);
      res.json(habits);
    } catch (error) {
      console.error("Error fetching habits:", error);
      res.status(500).json({ message: "Failed to fetch habits" });
    }
  });

  app.post('/api/habits', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const habitData = insertHabitSchema.parse(req.body);
      const habit = await storage.createHabit(habitData, userId);
      res.json(habit);
    } catch (error) {
      console.error("Error creating habit:", error);
      res.status(400).json({ message: "Failed to create habit" });
    }
  });

  app.patch('/api/habits/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const habitId = req.params.id;
      const habitData = insertHabitSchema.partial().parse(req.body);
      const habit = await storage.updateHabit(habitId, habitData, userId);
      if (!habit) {
        return res.status(404).json({ message: "Habit not found" });
      }
      res.json(habit);
    } catch (error) {
      console.error("Error updating habit:", error);
      res.status(400).json({ message: "Failed to update habit" });
    }
  });

  app.delete('/api/habits/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const habitId = req.params.id;
      const success = await storage.deleteHabit(habitId, userId);
      if (!success) {
        return res.status(404).json({ message: "Habit not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting habit:", error);
      res.status(500).json({ message: "Failed to delete habit" });
    }
  });

  // Habit log routes
  app.post('/api/habits/:id/log', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const habitId = req.params.id;
      const logData = insertHabitLogSchema.parse({ ...req.body, habitId });
      const log = await storage.logHabit(logData, userId);
      
      // Update user stats after logging
      const user = await storage.getUser(userId);
      if (user && log.completed) {
        const newPoints = user.totalPoints + 10; // 10 points per completed habit
        // Calculate streak would require more complex logic
        await storage.updateUserStats(userId, newPoints, user.currentStreak, user.longestStreak);
      }
      
      res.json(log);
    } catch (error) {
      console.error("Error logging habit:", error);
      res.status(400).json({ message: "Failed to log habit" });
    }
  });

  app.get('/api/habits/:id/logs', isAuthenticated, async (req: any, res) => {
    try {
      const habitId = req.params.id;
      const { startDate, endDate } = req.query;
      const logs = await storage.getHabitLogs(
        habitId,
        startDate as string,
        endDate as string
      );
      res.json(logs);
    } catch (error) {
      console.error("Error fetching habit logs:", error);
      res.status(500).json({ message: "Failed to fetch habit logs" });
    }
  });

  app.get('/api/habit-logs/today', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const today = new Date().toISOString().split('T')[0];
      const logs = await storage.getUserHabitLogs(userId, today);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching today's logs:", error);
      res.status(500).json({ message: "Failed to fetch today's logs" });
    }
  });

  app.get('/api/habit-logs/contribution', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { startDate, endDate } = req.query;
      const logs = await storage.getHabitLogsForContribution(
        userId,
        startDate as string,
        endDate as string
      );
      res.json(logs);
    } catch (error) {
      console.error("Error fetching contribution data:", error);
      res.status(500).json({ message: "Failed to fetch contribution data" });
    }
  });

  // Pomodoro routes
  app.post('/api/pomodoro', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const sessionData = insertPomodoroSessionSchema.parse(req.body);
      const session = await storage.createPomodoroSession(sessionData, userId);
      
      // Award points for completed sessions
      if (session.completed) {
        const user = await storage.getUser(userId);
        if (user) {
          const points = session.duration === 25 ? 25 : 10; // 25 points for focus, 10 for breaks
          await storage.updateUserStats(userId, user.totalPoints + points, user.currentStreak, user.longestStreak);
        }
      }
      
      res.json(session);
    } catch (error) {
      console.error("Error creating pomodoro session:", error);
      res.status(400).json({ message: "Failed to create pomodoro session" });
    }
  });

  app.get('/api/pomodoro/today', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const today = new Date().toISOString().split('T')[0];
      const sessions = await storage.getUserPomodoroSessions(userId, today);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching pomodoro sessions:", error);
      res.status(500).json({ message: "Failed to fetch pomodoro sessions" });
    }
  });

  // Achievement routes
  app.get('/api/achievements', isAuthenticated, async (req: any, res) => {
    try {
      const achievements = await storage.getAchievements();
      res.json(achievements);
    } catch (error) {
      console.error("Error fetching achievements:", error);
      res.status(500).json({ message: "Failed to fetch achievements" });
    }
  });

  app.get('/api/user-achievements', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const userAchievements = await storage.getUserAchievements(userId);
      res.json(userAchievements);
    } catch (error) {
      console.error("Error fetching user achievements:", error);
      res.status(500).json({ message: "Failed to fetch user achievements" });
    }
  });

  // AI Insights routes
  app.post('/api/insights/generate', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { weekStart } = req.body;
      
      // Check if insights already exist for this week
      const existingInsights = await storage.getWeeklyInsight(userId, weekStart);
      if (existingInsights) {
        return res.json(existingInsights);
      }
      
      // Gather data for insights
      const habits = await storage.getUserHabits(userId);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      const allLogs = await Promise.all(
        habits.map(async (habit) => {
          const logs = await storage.getHabitLogs(
            habit.id,
            weekStart,
            weekEnd.toISOString().split('T')[0]
          );
          return logs;
        })
      );
      
      const flatLogs = allLogs.flat();
      const completedLogs = flatLogs.filter(log => log.completed);
      const pomodoroSessions = await storage.getUserPomodoroSessions(userId, weekStart);
      const user = await storage.getUser(userId);
      
      const insightData = {
        habitsCompleted: completedLogs.length,
        totalHabits: habits.length * 7,
        completionRate: habits.length > 0 ? Math.round((completedLogs.length / (habits.length * 7)) * 100) : 0,
        currentStreak: user?.currentStreak || 0,
        pomodoroSessions: pomodoroSessions.filter(s => s.completed).length,
        focusTime: pomodoroSessions.filter(s => s.completed && s.sessionType === 'focus').reduce((sum, s) => sum + s.duration, 0),
        categoriesActive: [...new Set(habits.map(h => h.category))],
        missedDays: 7 - new Set(completedLogs.map(log => log.date)).size,
      };
      
      const insights = await generateWeeklyInsights(insightData);
      const savedInsights = await storage.saveWeeklyInsight(
        userId,
        weekStart,
        insights.insights,
        insights.recommendations,
        insights.motivationalTip
      );
      
      res.json(savedInsights);
    } catch (error) {
      console.error("Error generating insights:", error);
      res.status(500).json({ message: "Failed to generate insights" });
    }
  });

  app.get('/api/insights/:weekStart', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { weekStart } = req.params;
      const insights = await storage.getWeeklyInsight(userId, weekStart);
      if (!insights) {
        return res.status(404).json({ message: "Insights not found for this week" });
      }
      res.json(insights);
    } catch (error) {
      console.error("Error fetching insights:", error);
      res.status(500).json({ message: "Failed to fetch insights" });
    }
  });

  // Leaderboard routes
  app.get('/api/leaderboard', isAuthenticated, async (req: any, res) => {
    try {
      const leaderboard = await storage.getLeaderboard();
      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  // Report generation routes
  app.get('/api/reports/weekly/:weekStart', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { weekStart } = req.params;
      
      const pdfBuffer = await generateWeeklyReport(userId, weekStart);
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="weekly-report-${weekStart}.pdf"`);
      res.send(pdfBuffer);
    } catch (error) {
      console.error("Error generating report:", error);
      res.status(500).json({ message: "Failed to generate weekly report" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
