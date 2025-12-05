import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User, Mail, Calendar, Bell } from "lucide-react";
import { motion } from "framer-motion";
import NotificationSettings from "@/components/NotificationSettings";

export default function Profile() {
    const { user: rawUser, logoutMutation } = useAuth();
    const user = rawUser as any;

    if (!user) return null;

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-8">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
            >
                <h1 className="text-3xl font-bold text-foreground mb-2">My Profile</h1>
                <p className="text-muted-foreground mb-8">Manage your account settings</p>

                <Card className="shadow-soft border-none rounded-[2rem] overflow-hidden">
                    <CardHeader className="bg-primary/10 pb-10 pt-10 text-center">
                        <div className="mx-auto w-24 h-24 relative mb-4">
                            <Avatar className="w-24 h-24 border-4 border-background shadow-lg">
                                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} />
                                <AvatarFallback className="text-2xl">{user.username[0].toUpperCase()}</AvatarFallback>
                            </Avatar>
                        </div>
                        <CardTitle className="text-2xl font-bold">{user.firstName} {user.lastName}</CardTitle>
                        <p className="text-muted-foreground">@{user.username}</p>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="flex items-center p-4 bg-secondary/30 rounded-2xl">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                                        <User className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Full Name</p>
                                        <p className="font-medium">{user.firstName} {user.lastName}</p>
                                    </div>
                                </div>

                                <div className="flex items-center p-4 bg-secondary/30 rounded-2xl">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                                        <Mail className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Email</p>
                                        <p className="font-medium">{user.email || "No email linked"}</p>
                                    </div>
                                </div>

                                <div className="flex items-center p-4 bg-secondary/30 rounded-2xl">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                                        <Calendar className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Member Since</p>
                                        <p className="font-medium">{new Date(user.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t">
                                <h3 className="font-bold mb-4 flex items-center gap-2">
                                    <Bell className="h-5 w-5 text-primary" />
                                    Notifications
                                </h3>
                                <NotificationSettings />
                            </div>

                            <div className="pt-6 border-t">
                                <Button
                                    variant="destructive"
                                    className="w-full sm:w-auto rounded-xl"
                                    onClick={() => logoutMutation.mutate()}
                                    disabled={logoutMutation.isPending}
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Sign Out
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
