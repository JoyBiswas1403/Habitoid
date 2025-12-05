import { useQuery } from "@tanstack/react-query";
import { Flame } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

// Exact LeaderboardPage from app.jsx
export default function Leaderboard() {
  const { user } = useAuth();

  const { data: leaderboard = [], isLoading } = useQuery({
    queryKey: ["/api/leaderboard"],
  });

  const mockUsers = [
    { name: "Sarah J.", points: 5420, streak: 45, img: "bg-purple-200" },
    { name: "Mike Ross", points: 4900, streak: 32, img: "bg-blue-200" },
    { name: `${(user as any)?.firstName || (user as any)?.username || 'You'}`, points: (user as any)?.totalPoints || 2450, streak: (user as any)?.currentStreak || 12, img: "bg-[#50A65C]", active: true },
    { name: "Jessica P.", points: 2100, streak: 8, img: "bg-orange-200" },
    { name: "Louis Litt", points: 1850, streak: 5, img: "bg-red-200" },
  ];

  // Use real leaderboard if available, otherwise mock
  const displayUsers = (leaderboard as any[]).length > 0
    ? (leaderboard as any[]).map((u: any, i: number) => ({
      name: u.firstName || u.username,
      points: u.totalPoints || 0,
      streak: u.currentStreak || 0,
      img: i === 0 ? 'bg-purple-200' : i === 1 ? 'bg-blue-200' : i === 2 ? 'bg-[#50A65C]' : 'bg-orange-200',
      active: u.id === (user as any)?.id
    }))
    : mockUsers;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-black mb-2">Community Leaderboard</h1>
        <p style={{ color: 'var(--muted)' }}>See how you stack up against other Habitoids.</p>
      </div>

      {/* Table */}
      <div
        className="rounded-2xl shadow-sm border overflow-hidden"
        style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
      >
        {/* Header Row */}
        <div
          className="grid grid-cols-12 p-4 border-b text-xs font-bold uppercase tracking-wider"
          style={{ backgroundColor: 'var(--accent-light)', borderColor: 'var(--border)', color: 'var(--muted)' }}
        >
          <div className="col-span-1 text-center">Rank</div>
          <div className="col-span-6 pl-4">User</div>
          <div className="col-span-3 text-right">Points</div>
          <div className="col-span-2 text-right">Streak</div>
        </div>

        {/* User Rows */}
        {displayUsers.map((u: any, i: number) => (
          <div
            key={i}
            className="grid grid-cols-12 p-4 items-center border-b last:border-0 transition-colors"
            style={{
              borderColor: 'var(--border)',
              backgroundColor: u.active ? 'rgba(80, 166, 92, 0.1)' : 'transparent'
            }}
            onMouseEnter={(e) => { if (!u.active) e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)'; }}
            onMouseLeave={(e) => { if (!u.active) e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            {/* Rank */}
            <div className="col-span-1 text-center font-black" style={{ color: 'var(--muted)' }}>
              {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
            </div>

            {/* User */}
            <div className="col-span-6 pl-4 flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full ${u.img} flex items-center justify-center text-xs font-bold text-black`}
              >
                {u.name.charAt(0)}
              </div>
              <span className="font-bold" style={{ color: u.active ? 'var(--primary)' : 'inherit' }}>
                {u.name}
              </span>
              {u.active && (
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded ml-2"
                  style={{ backgroundColor: 'var(--sidebar)', color: 'white' }}
                >
                  YOU
                </span>
              )}
            </div>

            {/* Points */}
            <div className="col-span-3 text-right font-mono font-bold" style={{ color: 'var(--muted)' }}>
              {u.points}
            </div>

            {/* Streak */}
            <div className="col-span-2 text-right font-mono flex items-center justify-end gap-1" style={{ color: 'var(--muted)' }}>
              <Flame size={12} className="text-orange-400" /> {u.streak}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
