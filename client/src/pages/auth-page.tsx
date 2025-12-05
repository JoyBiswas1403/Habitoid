import { useForm } from "react-hook-form";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { HabitoidLogo } from "@/components/HabitoidLogo";
import { Github } from "lucide-react";
import { Mail, Lock, ArrowLeft } from "lucide-react";

const authSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    email: z.string().email("Invalid email address").optional().or(z.literal("")),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().optional(),
}).refine((data) => {
    if (data.confirmPassword && data.password !== data.confirmPassword) {
        return false;
    }
    return true;
}, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

type AuthFormData = z.infer<typeof authSchema>;

// Exact AuthPage from app.jsx
export default function AuthPage() {
    const { loginMutation, registerMutation, user } = useAuth();
    const [, setLocation] = useLocation();
    const [isLogin, setIsLogin] = useState(true);

    if (user) {
        setLocation("/");
        return null;
    }

    const handleSubmit = (data: AuthFormData) => {
        if (isLogin) {
            loginMutation.mutate(data);
        } else {
            registerMutation.mutate(data);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 animate-in fade-in" style={{ backgroundColor: 'var(--bg)' }}>
            <div
                className="w-full max-w-md rounded-3xl shadow-xl p-8 border"
                style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
            >
                {/* Logo */}
                <div className="flex justify-center mb-6">
                    <HabitoidLogo size={60} />
                </div>

                <h2 className="text-2xl font-black text-center mb-2">
                    {isLogin ? "Welcome Back!" : "Create Account"}
                </h2>
                <p className="text-center mb-8" style={{ color: 'var(--muted)' }}>
                    {isLogin ? "Ready to crush your goals with Slash?" : "Join thousands building better habits!"}
                </p>

                <AuthForm
                    isLogin={isLogin}
                    onSubmit={handleSubmit}
                    isLoading={loginMutation.isPending || registerMutation.isPending}
                />

                {/* Divider */}
                <div className="my-6 flex items-center gap-2">
                    <div className="h-[1px] flex-1" style={{ backgroundColor: 'var(--border)' }} />
                    <span className="text-xs font-bold uppercase" style={{ color: 'var(--muted)' }}>
                        OR CONTINUE WITH
                    </span>
                    <div className="h-[1px] flex-1" style={{ backgroundColor: 'var(--border)' }} />
                </div>

                {/* OAuth */}
                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => window.location.href = "/api/auth/github"}
                        className="flex items-center justify-center gap-2 border-2 py-2 rounded-xl font-bold text-sm transition-colors"
                        style={{ borderColor: 'var(--border)' }}
                    >
                        <Github size={18} /> GitHub
                    </button>
                    <button
                        onClick={() => window.location.href = "/api/auth/google"}
                        className="flex items-center justify-center gap-2 border-2 py-2 rounded-xl font-bold text-sm transition-colors"
                        style={{ borderColor: 'var(--border)' }}
                    >
                        <span className="text-blue-500 font-serif font-bold">G</span> Google
                    </button>
                </div>

                {/* Toggle login/register */}
                <p
                    className="text-center mt-6 text-sm cursor-pointer hover:underline"
                    style={{ color: 'var(--muted)' }}
                    onClick={() => setIsLogin(!isLogin)}
                >
                    {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
                </p>

                {/* Back to home */}
                <p
                    className="text-center mt-4 text-sm cursor-pointer flex items-center justify-center gap-1"
                    style={{ color: 'var(--muted)' }}
                    onClick={() => setLocation("/")}
                >
                    <ArrowLeft size={14} /> Back to Home
                </p>
            </div>
        </div>
    );
}

function AuthForm({
    isLogin,
    onSubmit,
    isLoading,
}: {
    isLogin: boolean;
    onSubmit: (data: AuthFormData) => void;
    isLoading: boolean;
}) {
    const form = useForm<AuthFormData>({
        resolver: zodResolver(authSchema),
        defaultValues: {
            username: "",
            password: "",
            email: "",
            firstName: "",
            lastName: "",
            confirmPassword: "",
        },
    });

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="block text-sm font-bold mb-1">
                                {isLogin ? "Email" : "Username"}
                            </FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Mail
                                        className="absolute left-3 top-3"
                                        size={18}
                                        style={{ color: 'var(--muted)' }}
                                    />
                                    <input
                                        placeholder={isLogin ? "george@habitoid.com" : "Choose a username"}
                                        {...field}
                                        className="w-full pl-10 pr-4 py-2 border-2 rounded-xl focus:outline-none transition-colors"
                                        style={{
                                            borderColor: 'var(--border)',
                                            backgroundColor: 'var(--bg)',
                                            color: 'var(--text)'
                                        }}
                                        onFocus={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                                        onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                                    />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="block text-sm font-bold mb-1">Password</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Lock
                                        className="absolute left-3 top-3"
                                        size={18}
                                        style={{ color: 'var(--muted)' }}
                                    />
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        {...field}
                                        className="w-full pl-10 pr-4 py-2 border-2 rounded-xl focus:outline-none transition-colors"
                                        style={{
                                            borderColor: 'var(--border)',
                                            backgroundColor: 'var(--bg)',
                                            color: 'var(--text)'
                                        }}
                                        onFocus={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                                        onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                                    />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {isLogin && (
                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={() => window.location.href = "/#/forgot-password"}
                            className="text-sm font-medium"
                            style={{ color: 'var(--primary)' }}
                        >
                            Forgot Password?
                        </button>
                    </div>
                )}

                <button
                    type="submit"
                    className="w-full py-3 text-lg rounded-lg font-bold transition-all active:scale-95 mt-4"
                    style={{ backgroundColor: 'var(--sidebar)', color: 'var(--bg)' }}
                    disabled={isLoading}
                >
                    {isLoading ? "Loading..." : "Log In"}
                </button>
            </form>
        </Form>
    );
}
