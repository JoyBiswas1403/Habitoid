import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Mail, KeyRound, CheckCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

const forgotPasswordSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
});

const resetPasswordSchema = z.object({
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;
type ResetPasswordData = z.infer<typeof resetPasswordSchema>;

export default function ForgotPasswordPage() {
    const [, setLocation] = useLocation();
    const { toast } = useToast();
    const [step, setStep] = useState<"email" | "reset" | "success">("email");

    // Check for token in URL
    const urlParams = new URLSearchParams(window.location.hash.split("?")[1] || "");
    const token = urlParams.get("token");

    // If token is present, show reset form
    if (token && step === "email") {
        setStep("reset");
    }

    const forgotPasswordForm = useForm<ForgotPasswordData>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: { email: "" },
    });

    const resetPasswordForm = useForm<ResetPasswordData>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: { newPassword: "", confirmPassword: "" },
    });

    const forgotPasswordMutation = useMutation({
        mutationFn: async (data: ForgotPasswordData) => {
            return apiRequest("POST", "/api/forgot-password", data);
        },
        onSuccess: () => {
            toast({
                title: "Email Sent!",
                description: "If an account exists with that email, you'll receive a password reset link.",
            });
            setStep("success");
        },
        onError: () => {
            toast({
                title: "Error",
                description: "Something went wrong. Please try again.",
                variant: "destructive",
            });
        },
    });

    const resetPasswordMutation = useMutation({
        mutationFn: async (data: ResetPasswordData) => {
            return apiRequest("POST", "/api/reset-password", {
                token,
                newPassword: data.newPassword,
            });
        },
        onSuccess: () => {
            toast({
                title: "Password Reset!",
                description: "Your password has been successfully reset. You can now log in.",
            });
            setLocation("/auth");
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.message || "Failed to reset password. The link may have expired.",
                variant: "destructive",
            });
        },
    });

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
            </div>

            <Card className="w-full max-w-md relative z-10 shadow-soft rounded-[2.5rem] border-none">
                <CardHeader className="text-center pt-10 pb-6">
                    <div className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg overflow-hidden">
                        <img src="/logo.png" alt="Habitoid" className="w-full h-full object-cover" />
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight">
                        {step === "email" && "Forgot Password?"}
                        {step === "reset" && "Reset Password"}
                        {step === "success" && "Check Your Email"}
                    </CardTitle>
                    <CardDescription className="text-base mt-2">
                        {step === "email" && "Enter your email to receive a password reset link"}
                        {step === "reset" && "Enter your new password below"}
                        {step === "success" && "We've sent you a password reset link"}
                    </CardDescription>
                </CardHeader>

                <CardContent className="px-8 pb-10">
                    {step === "email" && (
                        <Form {...forgotPasswordForm}>
                            <form onSubmit={forgotPasswordForm.handleSubmit((data) => forgotPasswordMutation.mutate(data))} className="space-y-4">
                                <FormField
                                    control={forgotPasswordForm.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="pl-1">Email Address</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        type="email"
                                                        placeholder="Enter your email"
                                                        {...field}
                                                        className="rounded-xl bg-secondary/30 border-transparent focus:bg-background h-11 pl-10"
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage className="pl-1" />
                                        </FormItem>
                                    )}
                                />

                                <Button
                                    type="submit"
                                    className="w-full h-11 rounded-xl font-semibold text-base"
                                    disabled={forgotPasswordMutation.isPending}
                                >
                                    {forgotPasswordMutation.isPending ? "Sending..." : "Send Reset Link"}
                                </Button>
                            </form>
                        </Form>
                    )}

                    {step === "reset" && (
                        <Form {...resetPasswordForm}>
                            <form onSubmit={resetPasswordForm.handleSubmit((data) => resetPasswordMutation.mutate(data))} className="space-y-4">
                                <FormField
                                    control={resetPasswordForm.control}
                                    name="newPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="pl-1">New Password</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        type="password"
                                                        placeholder="Enter new password"
                                                        {...field}
                                                        className="rounded-xl bg-secondary/30 border-transparent focus:bg-background h-11 pl-10"
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage className="pl-1" />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={resetPasswordForm.control}
                                    name="confirmPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="pl-1">Confirm Password</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        type="password"
                                                        placeholder="Confirm new password"
                                                        {...field}
                                                        className="rounded-xl bg-secondary/30 border-transparent focus:bg-background h-11 pl-10"
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage className="pl-1" />
                                        </FormItem>
                                    )}
                                />

                                <Button
                                    type="submit"
                                    className="w-full h-11 rounded-xl font-semibold text-base"
                                    disabled={resetPasswordMutation.isPending}
                                >
                                    {resetPasswordMutation.isPending ? "Resetting..." : "Reset Password"}
                                </Button>
                            </form>
                        </Form>
                    )}

                    {step === "success" && (
                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="h-8 w-8 text-green-600" />
                            </div>
                            <p className="text-muted-foreground">
                                Check your inbox for the password reset link. If you don't see it, check your spam folder.
                            </p>
                        </div>
                    )}

                    <div className="mt-6 text-center">
                        <button
                            type="button"
                            onClick={() => setLocation("/auth")}
                            className="inline-flex items-center text-sm text-primary hover:underline font-medium"
                        >
                            <ArrowLeft className="h-4 w-4 mr-1" />
                            Back to Login
                        </button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
