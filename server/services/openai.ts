import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface WeeklyInsightData {
  habitsCompleted: number;
  totalHabits: number;
  completionRate: number;
  currentStreak: number;
  pomodoroSessions: number;
  focusTime: number; // in minutes
  categoriesActive: string[];
  missedDays: number;
}

export interface GeneratedInsights {
  insights: string;
  recommendations: string;
  motivationalTip: string;
}

export async function generateWeeklyInsights(data: WeeklyInsightData): Promise<GeneratedInsights> {
  const prompt = `
    As a productivity coach, analyze this user's weekly habit tracking data and provide personalized insights.
    
    Weekly Data:
    - Habits completed: ${data.habitsCompleted} out of ${data.totalHabits} total habits
    - Completion rate: ${data.completionRate}%
    - Current streak: ${data.currentStreak} days
    - Pomodoro sessions: ${data.pomodoroSessions}
    - Focus time: ${Math.floor(data.focusTime / 60)}h ${data.focusTime % 60}m
    - Active categories: ${data.categoriesActive.join(', ')}
    - Missed days: ${data.missedDays}
    
    Provide a JSON response with:
    1. "insights": A detailed analysis of their performance, patterns, and areas of strength/improvement (2-3 sentences)
    2. "recommendations": Specific, actionable advice to improve their habit consistency and productivity (2-3 bullet points)
    3. "motivationalTip": An encouraging, personalized message that acknowledges their progress and motivates continued effort (1-2 sentences)
    
    Keep the tone encouraging and supportive while being honest about areas for improvement.
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are an expert productivity coach who provides personalized, actionable insights based on habit tracking data. Always respond with valid JSON in the requested format."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      insights: result.insights || "Your habit tracking shows consistent effort. Keep building on your current momentum.",
      recommendations: result.recommendations || "Continue tracking your habits daily and focus on maintaining consistency.",
      motivationalTip: result.motivationalTip || "Every small step counts towards building lasting habits. Keep going!"
    };
  } catch (error) {
    console.error("Failed to generate AI insights:", error);
    
    // Fallback insights based on the data
    return {
      insights: `This week you completed ${data.completionRate}% of your habits with a ${data.currentStreak}-day streak. Your ${data.pomodoroSessions} focus sessions show good time management discipline.`,
      recommendations: data.completionRate < 70 
        ? "Consider reducing the number of habits you're tracking to focus on consistency. Start with 2-3 core habits and build from there."
        : "Great consistency! Consider adding a new challenging habit or increasing the difficulty of existing ones.",
      motivationalTip: data.currentStreak > 7 
        ? `Your ${data.currentStreak}-day streak shows real commitment. Each day you continue strengthens the neural pathways that make these habits automatic.`
        : "Building habits takes time and patience. Focus on showing up consistently, even if it's just for a few minutes each day."
    };
  }
}
