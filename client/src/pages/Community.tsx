import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
    Users,
    Trophy,
    Activity,
    Share2,
    UserPlus,
    Copy,
    Check,
    Flame,
    Star,
    Crown,
    UserCheck,
    UserX
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { SlashCharacter } from "@/components/SlashCharacter";
import { getSlashEvolution, getWeeklyChallenge } from "@/lib/gamification";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Action type icons for activity feed
const ACTION_ICONS: Record<string, string> = {
    habit_complete: "✅",
    streak_milestone: "🔥",
    badge_unlock: "🏆",
    focus_session: "⏱️",
    level_up: "⚡",
    default: "📌"
};

export default function Community() {
    const { user } = useAuth();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<'feed' | 'friends' | 'leaderboard'>('feed');
    const [showShareModal, setShowShareModal] = useState(false);
    const [copied, setCopied] = useState(false);
    const [showAddFriendModal, setShowAddFriendModal] = useState(false);
    const [friendUsername, setFriendUsername] = useState('');

    // Fetch real data
    const { data: friends = [] } = useQuery({
        queryKey: ["/api/friends"],
    });

    const { data: friendRequests = [] } = useQuery({
        queryKey: ["/api/friends/requests"],
    });

    const { data: leaderboard = [] } = useQuery({
        queryKey: ["/api/leaderboard"],
    });

    // Mutations
    const addFriendMutation = useMutation({
        mutationFn: (username: string) => apiRequest("POST", "/api/friends/add", { username }),
        onSuccess: (data: any) => {
            if (data.success) {
                toast({ title: "Friend request sent!" });
                setFriendUsername('');
                setShowAddFriendModal(false);
            } else {
                toast({ title: "Error", description: data.message, variant: "destructive" });
            }
            queryClient.invalidateQueries({ queryKey: ["/api/friends"] });
        },
        onError: () => toast({ title: "Failed to add friend", variant: "destructive" }),
    });

    const acceptRequestMutation = useMutation({
        mutationFn: (requestId: string) => apiRequest("POST", `/api/friends/accept/${requestId}`),
        onSuccess: () => {
            toast({ title: "Friend request accepted!" });
            queryClient.invalidateQueries({ queryKey: ["/api/friends"] });
            queryClient.invalidateQueries({ queryKey: ["/api/friends/requests"] });
        },
    });

    const rejectRequestMutation = useMutation({
        mutationFn: (requestId: string) => apiRequest("POST", `/api/friends/reject/${requestId}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/friends/requests"] });
        },
    });

    const userPoints = (user as any)?.totalPoints || 0;
    const userStreak = (user as any)?.currentStreak || 0;
    const userName = (user as any)?.firstName || (user as any)?.username || 'User';
    const evolution = getSlashEvolution(userPoints);
    const challenge = getWeeklyChallenge();

    const handleCopyLink = () => {
        const shareLink = `${window.location.origin}/#/profile/${(user as any)?.id || 'user'}`;
        navigator.clipboard.writeText(shareLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast({ title: "Link copied!", description: "Share your profile with friends" });
    };

    const displayLeaderboard = (leaderboard as any[]).length > 0
        ? (leaderboard as any[]).map((u: any) => ({
            name: u.firstName || u.username,
            points: u.totalPoints || 0,
            streak: u.currentStreak || 0,
            active: u.id === (user as any)?.id
        }))
        : [
            { name: userName, points: userPoints, streak: userStreak, active: true },
        ];

    return (
        <div className="space-y-6 animate-in fade-in">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black">Community</h1>
                    <p className="font-medium" style={{ color: 'var(--muted)' }}>Connect with other Habitoids</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowShareModal(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold border transition-all"
                        style={{ borderColor: 'var(--border)' }}
                    >
                        <Share2 size={16} /> Share Stats
                    </button>
                    <button
                        onClick={() => setShowAddFriendModal(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all"
                        style={{ backgroundColor: 'var(--primary)', color: 'white' }}
                    >
                        <UserPlus size={16} /> Add Friend
                    </button>
                </div>
            </div>

            {/* Friend Requests */}
            {(friendRequests as any[]).length > 0 && (
                <div
                    className="rounded-2xl p-4 border"
                    style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
                >
                    <h3 className="font-bold mb-3">Friend Requests ({(friendRequests as any[]).length})</h3>
                    <div className="space-y-2">
                        {(friendRequests as any[]).map((req: any) => (
                            <div key={req.id} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: 'var(--accent-light)' }}>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white" style={{ backgroundColor: 'var(--primary)' }}>
                                        {req.requester?.username?.charAt(0) || '?'}
                                    </div>
                                    <span className="font-medium">{req.requester?.firstName || req.requester?.username}</span>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => acceptRequestMutation.mutate(req.id)}
                                        className="p-2 rounded-lg" style={{ backgroundColor: 'var(--primary)', color: 'white' }}
                                    >
                                        <UserCheck size={18} />
                                    </button>
                                    <button
                                        onClick={() => rejectRequestMutation.mutate(req.id)}
                                        className="p-2 rounded-lg border" style={{ borderColor: 'var(--border)' }}
                                    >
                                        <UserX size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Weekly Community Challenge */}
            <div
                className="rounded-2xl p-6 text-white relative overflow-hidden"
                style={{ backgroundColor: 'var(--sidebar)' }}
            >
                <div className="flex items-start justify-between relative z-10">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <Crown size={20} style={{ color: '#f59e0b' }} />
                            <span className="text-xs font-bold uppercase" style={{ color: '#f59e0b' }}>
                                Community Challenge
                            </span>
                        </div>
                        <h2 className="text-xl font-black mb-2">{challenge.name}</h2>
                        <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.6)' }}>
                            {challenge.description}
                        </p>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                                <Users size={16} />
                                <span className="text-sm">{(friends as any[]).length + 1} in your network</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Star size={16} style={{ color: '#f59e0b' }} />
                                <span className="text-sm font-bold" style={{ color: '#f59e0b' }}>+{challenge.reward} XP</span>
                            </div>
                        </div>
                    </div>
                    <div className="w-20 h-20">
                        <SlashCharacter expression="happy" className="w-full h-full" />
                    </div>
                </div>
                <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full opacity-20 blur-2xl" style={{ backgroundColor: 'var(--primary)' }} />
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b" style={{ borderColor: 'var(--border)' }}>
                {['feed', 'friends', 'leaderboard'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className="px-4 py-3 font-bold transition-all relative"
                        style={{
                            color: activeTab === tab ? 'var(--primary)' : 'var(--muted)',
                            borderBottom: activeTab === tab ? '2px solid var(--primary)' : '2px solid transparent'
                        }}
                    >
                        {tab === 'feed' && <Activity size={16} className="inline mr-2" />}
                        {tab === 'friends' && <Users size={16} className="inline mr-2" />}
                        {tab === 'leaderboard' && <Trophy size={16} className="inline mr-2" />}
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        {tab === 'friends' && (friends as any[]).length > 0 && (
                            <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full" style={{ backgroundColor: 'var(--primary)', color: 'white' }}>
                                {(friends as any[]).length}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Activity Feed Tab - Placeholder when no real activities */}
            {activeTab === 'feed' && (
                <div className="text-center py-12 rounded-2xl border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                    <Activity size={48} className="mx-auto mb-4" style={{ color: 'var(--muted)' }} />
                    <h3 className="font-bold mb-2">Activity Feed Coming Soon</h3>
                    <p className="text-sm" style={{ color: 'var(--muted)' }}>
                        Add friends to see their activity here!
                    </p>
                </div>
            )}

            {/* Friends Tab */}
            {activeTab === 'friends' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(friends as any[]).length === 0 ? (
                        <div className="col-span-2 text-center py-12 rounded-2xl border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                            <Users size={48} className="mx-auto mb-4" style={{ color: 'var(--muted)' }} />
                            <h3 className="font-bold mb-2">No Friends Yet</h3>
                            <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>
                                Add friends by their username to compete together!
                            </p>
                            <button
                                onClick={() => setShowAddFriendModal(true)}
                                className="px-4 py-2 rounded-lg font-bold"
                                style={{ backgroundColor: 'var(--primary)', color: 'white' }}
                            >
                                Add Your First Friend
                            </button>
                        </div>
                    ) : (
                        (friends as any[]).map((friend: any) => (
                            <div
                                key={friend.id}
                                className="flex items-center gap-4 p-4 rounded-xl border"
                                style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
                            >
                                <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white" style={{ backgroundColor: 'var(--primary)' }}>
                                    {(friend.firstName || friend.username || '?').charAt(0)}
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold">{friend.firstName || friend.username}</p>
                                    <p className="text-xs" style={{ color: 'var(--muted)' }}>@{friend.username}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold">{(friend.totalPoints || 0).toLocaleString()}</p>
                                    <div className="flex items-center justify-end gap-1 text-xs" style={{ color: 'var(--muted)' }}>
                                        <Flame size={12} className="text-orange-400" />
                                        {friend.currentStreak || 0} days
                                    </div>
                                </div>
                            </div>
                        ))
                    )}

                    {(friends as any[]).length > 0 && (
                        <button
                            onClick={() => setShowAddFriendModal(true)}
                            className="flex items-center justify-center gap-2 p-8 rounded-xl border-2 border-dashed transition-all"
                            style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
                        >
                            <UserPlus size={20} />
                            <span className="font-medium">Add More Friends</span>
                        </button>
                    )}
                </div>
            )}

            {/* Leaderboard Tab */}
            {activeTab === 'leaderboard' && (
                <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                    <div className="grid grid-cols-12 p-4 border-b text-xs font-bold uppercase tracking-wider" style={{ backgroundColor: 'var(--accent-light)', borderColor: 'var(--border)', color: 'var(--muted)' }}>
                        <div className="col-span-1 text-center">Rank</div>
                        <div className="col-span-6 pl-4">User</div>
                        <div className="col-span-3 text-right">Points</div>
                        <div className="col-span-2 text-right">Streak</div>
                    </div>
                    {displayLeaderboard.map((u: any, i: number) => (
                        <div
                            key={i}
                            className="grid grid-cols-12 p-4 items-center border-b last:border-0"
                            style={{ borderColor: 'var(--border)', backgroundColor: u.active ? 'rgba(80, 166, 92, 0.1)' : 'transparent' }}
                        >
                            <div className="col-span-1 text-center font-black" style={{ color: 'var(--muted)' }}>
                                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                            </div>
                            <div className="col-span-6 pl-4 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-xs font-bold text-white">
                                    {u.name.charAt(0)}
                                </div>
                                <span className="font-bold" style={{ color: u.active ? 'var(--primary)' : 'inherit' }}>
                                    {u.name}
                                </span>
                                {u.active && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--sidebar)', color: 'white' }}>
                                        YOU
                                    </span>
                                )}
                            </div>
                            <div className="col-span-3 text-right font-mono font-bold" style={{ color: 'var(--muted)' }}>
                                {u.points.toLocaleString()}
                            </div>
                            <div className="col-span-2 text-right font-mono flex items-center justify-end gap-1" style={{ color: 'var(--muted)' }}>
                                <Flame size={12} className="text-orange-400" /> {u.streak}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Share Stats Modal */}
            {showShareModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setShowShareModal(false)}>
                    <div className="w-full max-w-sm rounded-2xl p-6 shadow-xl" style={{ backgroundColor: 'var(--card)' }} onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-xl font-black mb-6 text-center">Share Your Stats</h3>
                        <div className="rounded-xl p-6 mb-6 text-center" style={{ backgroundColor: 'var(--sidebar)', color: 'white' }}>
                            <div className="w-16 h-16 mx-auto mb-4">
                                <SlashCharacter expression="happy" className="w-full h-full" />
                            </div>
                            <h4 className="text-lg font-bold mb-1">{userName}</h4>
                            <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.6)' }}>
                                {evolution.icon} {evolution.name}
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-2xl font-black">{userPoints}</p>
                                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Points</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-black">{userStreak}</p>
                                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Day Streak</p>
                                </div>
                            </div>
                        </div>
                        <button onClick={handleCopyLink} className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-bold" style={{ backgroundColor: 'var(--primary)', color: 'white' }}>
                            {copied ? <Check size={18} /> : <Copy size={18} />}
                            {copied ? 'Copied!' : 'Copy Share Link'}
                        </button>
                    </div>
                </div>
            )}

            {/* Add Friend Modal */}
            {showAddFriendModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setShowAddFriendModal(false)}>
                    <div className="w-full max-w-sm rounded-2xl p-6 shadow-xl" style={{ backgroundColor: 'var(--card)' }} onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-xl font-black mb-4 text-center">Add Friend</h3>
                        <p className="text-sm text-center mb-6" style={{ color: 'var(--muted)' }}>
                            Enter their username to send a friend request
                        </p>
                        <input
                            type="text"
                            placeholder="Username"
                            value={friendUsername}
                            onChange={(e) => setFriendUsername(e.target.value)}
                            className="w-full p-3 rounded-lg border mb-4"
                            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--accent-light)' }}
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowAddFriendModal(false)}
                                className="flex-1 py-3 rounded-lg font-bold border"
                                style={{ borderColor: 'var(--border)' }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => addFriendMutation.mutate(friendUsername)}
                                disabled={!friendUsername.trim()}
                                className="flex-1 py-3 rounded-lg font-bold"
                                style={{ backgroundColor: 'var(--primary)', color: 'white', opacity: friendUsername.trim() ? 1 : 0.5 }}
                            >
                                Send Request
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
