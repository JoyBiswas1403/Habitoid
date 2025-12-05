import PDFDocument from "pdfkit";
import { storage } from "../storage";

// Real PDF generation using pdfkit
export async function generateWeeklyReport(userId: string, weekStart: string): Promise<Buffer> {
  try {
    // Get user data
    const user = await storage.getUser(userId);
    if (!user) throw new Error("User not found");

    // Get habits and logs for the week
    const habits = await storage.getUserHabits(userId);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    // Get all habit logs for the week
    const allLogs = await Promise.all(
      habits.map(async (habit) => {
        const logs = await storage.getHabitLogs(
          habit.id,
          weekStart,
          weekEnd.toISOString().split('T')[0]
        );
        return { habit, logs };
      })
    );

    // Get AI insights
    const insights = await storage.getWeeklyInsight(userId, weekStart);

    // Calculate statistics
    const totalPossibleHabits = habits.length * 7;
    const completedHabits = allLogs.reduce((sum, { logs }) =>
      sum + logs.filter(log => log.completed).length, 0
    );
    const completionRate = totalPossibleHabits > 0 ? Math.round((completedHabits / totalPossibleHabits) * 100) : 0;

    // Create PDF document
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        info: {
          Title: 'Weekly Habit Report - Habitoid',
          Author: 'Habitoid',
          Subject: `Weekly Report for ${user.firstName} ${user.lastName}`,
        }
      });

      // Collect PDF chunks
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Colors
      const primaryColor = '#10b981'; // Green
      const textColor = '#1f2937';
      const mutedColor = '#6b7280';
      const bgColor = '#f9fafb';

      // Header with logo placeholder and title
      doc.rect(0, 0, doc.page.width, 120).fill(primaryColor);

      doc.fillColor('white')
        .fontSize(28)
        .font('Helvetica-Bold')
        .text('Habitoid', 50, 40);

      doc.fontSize(14)
        .font('Helvetica')
        .text('Weekly Habit Report', 50, 75);

      // User info
      doc.fontSize(12)
        .text(`${user.firstName || 'User'} ${user.lastName || ''}`, 50, 95);

      // Week range
      const weekStartDate = new Date(weekStart).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric'
      });
      const weekEndDate = weekEnd.toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric'
      });

      doc.fillColor(textColor)
        .fontSize(12)
        .text(`Week of ${weekStartDate} - ${weekEndDate}`, 50, 140, { align: 'center' });

      // Stats boxes
      const statsY = 170;
      const boxWidth = (doc.page.width - 150) / 4;
      const stats = [
        { label: 'Completion', value: `${completionRate}%` },
        { label: 'Streak', value: `${user.currentStreak || 0}` },
        { label: 'Completed', value: `${completedHabits}` },
        { label: 'Points', value: `${user.totalPoints || 0}` },
      ];

      stats.forEach((stat, i) => {
        const x = 50 + (i * (boxWidth + 15));
        doc.rect(x, statsY, boxWidth, 60).fill(bgColor);

        doc.fillColor(primaryColor)
          .fontSize(20)
          .font('Helvetica-Bold')
          .text(stat.value, x, statsY + 12, { width: boxWidth, align: 'center' });

        doc.fillColor(mutedColor)
          .fontSize(10)
          .font('Helvetica')
          .text(stat.label, x, statsY + 40, { width: boxWidth, align: 'center' });
      });

      // Habit Performance section
      let currentY = statsY + 90;

      doc.fillColor(textColor)
        .fontSize(16)
        .font('Helvetica-Bold')
        .text('Habit Performance', 50, currentY);

      currentY += 30;

      // List each habit
      allLogs.forEach(({ habit, logs }) => {
        const completed = logs.filter(log => log.completed).length;
        const rate = Math.round((completed / 7) * 100);

        // Check if we need a new page
        if (currentY > doc.page.height - 100) {
          doc.addPage();
          currentY = 50;
        }

        // Habit card background
        doc.rect(50, currentY, doc.page.width - 100, 50).fill(bgColor);

        // Habit name
        doc.fillColor(textColor)
          .fontSize(12)
          .font('Helvetica-Bold')
          .text(habit.name, 60, currentY + 10);

        // Category badge
        doc.fillColor(mutedColor)
          .fontSize(9)
          .font('Helvetica')
          .text(habit.category, 60, currentY + 28);

        // Progress
        const progressWidth = 100;
        const progressX = doc.page.width - 180;

        // Progress bar background
        doc.rect(progressX, currentY + 15, progressWidth, 8).fill('#e5e7eb');

        // Progress bar fill
        if (rate > 0) {
          doc.rect(progressX, currentY + 15, (progressWidth * rate) / 100, 8).fill(primaryColor);
        }

        // Percentage text
        doc.fillColor(rate >= 70 ? primaryColor : mutedColor)
          .fontSize(11)
          .font('Helvetica-Bold')
          .text(`${completed}/7 (${rate}%)`, progressX + progressWidth + 10, currentY + 12);

        currentY += 60;
      });

      // AI Insights section (if available)
      if (insights) {
        currentY += 20;

        // Check if we need a new page
        if (currentY > doc.page.height - 200) {
          doc.addPage();
          currentY = 50;
        }

        doc.fillColor(textColor)
          .fontSize(16)
          .font('Helvetica-Bold')
          .text('AI-Powered Insights', 50, currentY);

        currentY += 25;

        // Analysis
        if (insights.insights) {
          doc.rect(50, currentY, doc.page.width - 100, 60).fill(bgColor);
          doc.fillColor(primaryColor)
            .fontSize(10)
            .font('Helvetica-Bold')
            .text('Analysis', 60, currentY + 8);
          doc.fillColor(textColor)
            .fontSize(9)
            .font('Helvetica')
            .text(insights.insights, 60, currentY + 22, {
              width: doc.page.width - 120,
              lineGap: 2
            });
          currentY += 70;
        }

        // Recommendations
        if (insights.recommendations) {
          doc.rect(50, currentY, doc.page.width - 100, 60).fill(bgColor);
          doc.fillColor(primaryColor)
            .fontSize(10)
            .font('Helvetica-Bold')
            .text('Recommendations', 60, currentY + 8);
          doc.fillColor(textColor)
            .fontSize(9)
            .font('Helvetica')
            .text(insights.recommendations, 60, currentY + 22, {
              width: doc.page.width - 120,
              lineGap: 2
            });
          currentY += 70;
        }

        // Motivational tip
        if (insights.motivationalTip) {
          doc.rect(50, currentY, doc.page.width - 100, 50).fill('#fef3c7');
          doc.fillColor('#d97706')
            .fontSize(10)
            .font('Helvetica-Bold')
            .text('💡 Motivational Tip', 60, currentY + 8);
          doc.fillColor(textColor)
            .fontSize(9)
            .font('Helvetica')
            .text(insights.motivationalTip, 60, currentY + 22, {
              width: doc.page.width - 120,
              lineGap: 2
            });
        }
      }

      // Footer
      doc.fillColor(mutedColor)
        .fontSize(9)
        .font('Helvetica')
        .text(
          `Generated by Habitoid • ${new Date().toLocaleDateString()}`,
          50,
          doc.page.height - 40,
          { align: 'center', width: doc.page.width - 100 }
        );

      // Finalize PDF
      doc.end();
    });

  } catch (error) {
    console.error("Failed to generate PDF report:", error);
    throw new Error("Failed to generate weekly report");
  }
}
