import { useLocation } from "wouter";
import { HabitoidLogo } from "@/components/HabitoidLogo";
import { SlashCharacter } from "@/components/SlashCharacter";

// Exact LandingPage from app.jsx
export default function Landing() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center animate-in fade-in" style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}>
      <div className="max-w-4xl w-full">
        {/* Nav */}
        <nav className="flex justify-between items-center mb-20">
          <div className="flex items-center gap-2 font-black text-2xl tracking-tighter">
            <HabitoidLogo size={32} />
            <span>Habitoid</span>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setLocation("/auth")}
              className="px-4 py-2 rounded-lg font-bold transition-all active:scale-95"
              style={{ color: 'var(--muted)' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--muted)'}
            >
              Log In
            </button>
            <button
              onClick={() => setLocation("/auth")}
              className="px-4 py-2 rounded-lg font-bold transition-all active:scale-95 shadow-md"
              style={{ backgroundColor: 'var(--primary)', color: 'white' }}
              data-testid="button-login"
            >
              Get Started
            </button>
          </div>
        </nav>

        {/* Hero */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="text-left">
            <h1 className="text-6xl font-black leading-tight mb-6 tracking-tight">
              BUILD <span style={{ color: 'var(--primary)' }}>BETTER</span><br />
              HABITS WITH<br />
              SLASH
            </h1>
            <p className="text-xl mb-8 max-w-md" style={{ color: 'var(--muted)' }}>
              The all-in-one habit tracker, pomodoro timer, and accountability partner powered by AI insights.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setLocation("/auth")}
                className="px-8 py-4 text-lg rounded-lg font-bold transition-all active:scale-95 shadow-md"
                style={{ backgroundColor: 'var(--primary)', color: 'white' }}
              >
                Start Tracking Free
              </button>
              <button
                className="px-8 py-4 text-lg rounded-lg font-bold transition-all active:scale-95 border-2"
                style={{ borderColor: 'currentColor' }}
              >
                View Demo
              </button>
            </div>
          </div>

          {/* Slash Character - bouncing */}
          <div className="relative flex justify-center">
            <div
              className="absolute inset-0 rounded-full blur-[100px] opacity-20 transform translate-x-10 translate-y-10"
              style={{ backgroundColor: 'var(--primary)' }}
            />
            <div className="animate-bounce">
              <SlashCharacter expression="happy" className="w-80 h-80 drop-shadow-2xl relative z-10" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
