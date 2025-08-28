import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, Target, TrendingUp, Users, Zap } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-background sm:pb-16 md:pb-20 lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-bold text-foreground sm:text-5xl md:text-6xl">
                  <span className="block xl:inline">Build better habits with</span>{' '}
                  <span className="block text-primary xl:inline">HabitFlow</span>
                </h1>
                <p className="mt-3 text-base text-muted-foreground sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Transform your daily routines into powerful habits with AI-powered insights, 
                  gamification, and advanced tracking features. Join thousands of users building 
                  better lives one habit at a time.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <Button
                      size="lg"
                      className="w-full sm:w-auto"
                      onClick={() => window.location.href = "/api/login"}
                      data-testid="button-login"
                    >
                      Get Started Free
                    </Button>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-primary font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-bold tracking-tight text-foreground sm:text-4xl">
              Everything you need to build lasting habits
            </p>
            <p className="mt-4 max-w-2xl text-xl text-muted-foreground lg:mx-auto">
              Our comprehensive platform combines proven habit-building techniques with modern technology
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary text-primary-foreground">
                  <Target className="h-6 w-6" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-foreground">Smart Habit Tracking</p>
                <p className="mt-2 ml-16 text-base text-muted-foreground">
                  Create and track habits with intelligent streak calculations and GitHub-style contribution graphs
                </p>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary text-primary-foreground">
                  <Clock className="h-6 w-6" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-foreground">Pomodoro Timer</p>
                <p className="mt-2 ml-16 text-base text-muted-foreground">
                  Built-in focus timer with session tracking and productivity analytics
                </p>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary text-primary-foreground">
                  <Zap className="h-6 w-6" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-foreground">AI-Powered Insights</p>
                <p className="mt-2 ml-16 text-base text-muted-foreground">
                  Get personalized recommendations and motivational tips based on your habit data
                </p>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary text-primary-foreground">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-foreground">Gamification</p>
                <p className="mt-2 ml-16 text-base text-muted-foreground">
                  Earn points, unlock achievements, and level up as you build consistent habits
                </p>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary text-primary-foreground">
                  <Users className="h-6 w-6" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-foreground">Social Leaderboard</p>
                <p className="mt-2 ml-16 text-base text-muted-foreground">
                  Compare your progress with friends and stay motivated through friendly competition
                </p>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary text-primary-foreground">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-foreground">Weekly Reports</p>
                <p className="mt-2 ml-16 text-base text-muted-foreground">
                  Export detailed PDF reports with insights and progress analysis
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-primary">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-primary-foreground">
              Trusted by habit builders worldwide
            </h2>
            <p className="mt-3 text-xl text-primary-foreground/80 sm:mt-4">
              Join our growing community of productive individuals
            </p>
          </div>
          <dl className="mt-10 text-center sm:max-w-3xl sm:mx-auto sm:grid sm:grid-cols-3 sm:gap-8">
            <div className="flex flex-col">
              <dt className="order-2 mt-2 text-lg leading-6 font-medium text-primary-foreground/80">
                Active Users
              </dt>
              <dd className="order-1 text-5xl font-bold text-primary-foreground">
                10K+
              </dd>
            </div>
            <div className="flex flex-col mt-10 sm:mt-0">
              <dt className="order-2 mt-2 text-lg leading-6 font-medium text-primary-foreground/80">
                Habits Completed
              </dt>
              <dd className="order-1 text-5xl font-bold text-primary-foreground">
                500K+
              </dd>
            </div>
            <div className="flex flex-col mt-10 sm:mt-0">
              <dt className="order-2 mt-2 text-lg leading-6 font-medium text-primary-foreground/80">
                Average Streak
              </dt>
              <dd className="order-1 text-5xl font-bold text-primary-foreground">
                21 days
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-background">
        <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
            <span className="block">Ready to transform your life?</span>
            <span className="block text-primary">Start building better habits today.</span>
          </h2>
          <p className="mt-4 text-lg leading-6 text-muted-foreground">
            No credit card required. Get started in under 30 seconds.
          </p>
          <Button
            size="lg"
            className="mt-8"
            onClick={() => window.location.href = "/api/login"}
            data-testid="button-signup"
          >
            Sign Up Free
          </Button>
        </div>
      </div>
    </div>
  );
}
