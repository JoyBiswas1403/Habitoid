import { useForm } from "react-hook-form";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const authSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

type AuthFormData = z.infer<typeof authSchema>;

export default function AuthPage() {
    const { loginMutation, registerMutation, user } = useAuth();
    const [, setLocation] = useLocation();
    const [activeTab, setActiveTab] = useState<"login" | "register">("login");

    if (user) {
        setLocation("/");
        return null;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
                <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl" />
            </div>

            <Card className="w-full max-w-md relative z-10 shadow-soft rounded-[2.5rem] border-none">
                <CardHeader className="text-center pt-10 pb-6">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-400 to-yellow-400 rounded-2xl flex items-center justify-center mb-4 shadow-lg transform rotate-3">
                        <span className="text-3xl text-white font-bold">H</span>
                    </div>
                    <CardTitle className="text-3xl font-bold tracking-tight">HabitFlow</CardTitle>
                    <CardDescription className="text-base mt-2">
                        Build better habits, one day at a time
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-8 pb-10">
                    <div className="grid w-full grid-cols-2 mb-8 bg-secondary/50 p-1.5 rounded-full">
                        <button
                            onClick={() => setActiveTab("login")}
                            className={`text-sm font-semibold py-2.5 rounded-full transition-all duration-300 ${activeTab === "login"
                                    ? "bg-white text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            Login
                        </button>
                        <button
                            onClick={() => setActiveTab("register")}
                            className={`text-sm font-semibold py-2.5 rounded-full transition-all duration-300 ${activeTab === "register"
                                    ? "bg-white text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            Register
                        </button>
                    </div>

                    {activeTab === "login" && (
                        <AuthForm
                            key="login-form"
                            mode="login"
                            onSubmit={(data) => loginMutation.mutate(data)}
                            isLoading={loginMutation.isPending}
                        />
                    )}

                    {activeTab === "register" && (
                        <AuthForm
                            key="register-form"
                            mode="register"
                            onSubmit={(data) => registerMutation.mutate(data)}
                            isLoading={registerMutation.isPending}
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

function AuthForm({
    mode,
    onSubmit,
    isLoading,
}: {
    mode: "login" | "register";
    onSubmit: (data: AuthFormData) => void;
    isLoading: boolean;
}) {
    const form = useForm<AuthFormData>({
        resolver: zodResolver(authSchema),
        defaultValues: {
            username: "",
            password: "",
        },
    });

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="pl-1">Username</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Enter your username"
                                    {...field}
                                    className="rounded-xl bg-secondary/30 border-transparent focus:bg-background focus:border-primary/20 h-12"
                                />
                            </FormControl>
                            <FormMessage className="pl-1" />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="pl-1">Password</FormLabel>
                            <FormControl>
                                <Input
                                    type="password"
                                    placeholder="Enter your password"
                                    {...field}
                                    className="rounded-xl bg-secondary/30 border-transparent focus:bg-background focus:border-primary/20 h-12"
                                />
                            </FormControl>
                            <FormMessage className="pl-1" />
                        </FormItem>
                    )}
                />
                <Button
                    type="submit"
                    className="w-full h-12 rounded-xl text-base font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all mt-2"
                    disabled={isLoading}
                >
                    {isLoading
                        ? mode === "login"
                            ? "Signing in..."
                            : "Creating account..."
                        : mode === "login"
                            ? "Sign In"
                            : "Create Account"}
                </Button>
            </form>
        </Form>
    );
}
