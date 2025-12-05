/**
 * Habitoid - Build Better Habits
 * Copyright (c) 2025 Habitoid Team
 * Owner: Joy Biswas (bjoy1403@gmail.com)
 * Licensed under the MIT License
 */

import { Switch, Route, useLocation, Router as WouterRouter } from "wouter";
import useHashLocation from "@/hooks/useHashLocation";
import { AnimatePresence } from "framer-motion";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import AuthPage from "@/pages/auth-page";
import ForgotPassword from "@/pages/ForgotPassword";
import Dashboard from "@/pages/Dashboard";
import Habits from "@/pages/Habits";
import Timer from "@/pages/Timer";
import Calendar from "@/pages/Calendar";
import Insights from "@/pages/Insights";
import Analytics from "@/pages/Analytics";
import Leaderboard from "@/pages/Leaderboard";
import Community from "@/pages/Community";
import Achievements from "@/pages/Achievements";
import Goals from "@/pages/Goals";
import Profile from "@/pages/Profile";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";

function Router() {
  const { isAuthenticated, isLoading, error } = useAuth();
  // useLocation is now provided by the parent WouterRouter with hash hook
  const [location, setLocation] = useHashLocation();

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center min-h-screen text-destructive">Error: {error.message}</div>;
  }

  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/auth" component={AuthPage} />
        <Route path="/forgot-password" component={ForgotPassword} />
        <Route path="/reset-password" component={ForgotPassword} />
        <Route path="/" component={Landing} />
        <Route component={() => {
          // Use useEffect to avoid updating state during render
          import("react").then(({ useEffect }) => {
            useEffect(() => setLocation("/auth"), [setLocation]);
          });
          return null;
        }} />
      </Switch>
    );
  }

  return (
    <div className="h-full flex bg-background text-foreground">
      <Sidebar />
      <div className="lg:pl-80 flex flex-col flex-1">
        <TopBar />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 lg:p-6">
          <AnimatePresence mode="wait">
            <Switch location={location} key={location}>
              <Route path="/" component={Dashboard} />
              <Route path="/dashboard" component={Dashboard} />
              <Route path="/habits" component={Habits} />
              <Route path="/timer" component={Timer} />
              <Route path="/calendar" component={Calendar} />
              <Route path="/insights" component={Insights} />
              <Route path="/analytics" component={Analytics} />
              <Route path="/leaderboard" component={Leaderboard} />
              <Route path="/community" component={Community} />
              <Route path="/achievements" component={Achievements} />
              <Route path="/goals" component={Goals} />
              <Route path="/profile" component={Profile} />
              <Route path="/settings" component={Profile} />
              <Route path="/auth" component={() => {
                import("react").then(({ useEffect }) => {
                  useEffect(() => setLocation("/"), [setLocation]);
                });
                return null;
              }} />
              <Route component={NotFound} />
            </Switch>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <WouterRouter hook={useHashLocation}>
            <Router />
          </WouterRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
