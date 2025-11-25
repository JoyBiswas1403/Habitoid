
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";


const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
    const salt = randomBytes(16).toString("hex");
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
    const [hashed, salt] = stored.split(".");
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
    return timingSafeEqual(hashedBuf, suppliedBuf);
}

import pgSession from "connect-pg-simple";
// ... existing imports ...

// ... existing imports ...

export function setupAuth(app: Express) {
    const PostgresqlStore = pgSession(session);
    const sessionSettings: session.SessionOptions = {
        secret: process.env.SESSION_SECRET || "habitflow_secret_key",
        resave: false,
        saveUninitialized: false,
        store: new PostgresqlStore({
            conString: process.env.DATABASE_URL,
            createTableIfMissing: true,
        }),
        cookie: {
            secure: app.get("env") === "production",
            sameSite: "lax", // Allow cookies for same-site (localhost/10.0.2.2 are treated loosely in dev)
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        },
    };

    app.set("trust proxy", 1);
    app.use(session(sessionSettings));
    app.use(passport.initialize());
    app.use(passport.session());

    passport.use(
        new LocalStrategy(async (username, password, done) => {
            try {
                // Allow login with username OR email
                let user = await storage.getUserByUsername(username);
                if (!user) {
                    user = await storage.getUserByEmail(username);
                }

                if (!user || !user.password || !(await comparePasswords(password, user.password))) {
                    return done(null, false);
                } else {
                    return done(null, user);
                }
            } catch (err) {
                return done(err);
            }
        }),
    );

    passport.serializeUser((user, done) => done(null, (user as SelectUser).id));
    passport.deserializeUser(async (id: string, done) => {
        try {
            const user = await storage.getUser(id);
            done(null, user);
        } catch (err) {
            done(err);
        }
    });

    app.post("/api/register", async (req, res, next) => {
        try {
            const existingUser = await storage.getUserByUsername(req.body.username);
            if (existingUser) {
                return res.status(400).send("Username already exists");
            }

            const existingEmail = await storage.getUserByEmail(req.body.email);
            if (existingEmail) {
                return res.status(400).send("Email already exists");
            }

            const hashedPassword = await hashPassword(req.body.password);
            const user = await storage.upsertUser({
                ...req.body,
                password: hashedPassword,
            });

            req.login(user, (err) => {
                if (err) return next(err);
                req.session.save(() => {
                    res.status(201).json(user);
                });
            });
        } catch (err) {
            next(err);
        }
    });

    app.post("/api/login", passport.authenticate("local"), (req, res) => {
        req.session.save(() => {
            res.status(200).json(req.user);
        });
    });

    app.post("/api/logout", (req, res, next) => {
        req.logout((err) => {
            if (err) return next(err);
            res.sendStatus(200);
        });
    });

    app.get("/api/user", (req, res) => {
        if (!req.isAuthenticated()) return res.sendStatus(401);
        res.json(req.user);
    });

    // Password Reset Endpoints
    app.post("/api/forgot-password", async (req, res) => {
        const { email } = req.body;
        const user = await storage.getUserByEmail(email);
        if (!user) {
            // Don't reveal if user exists
            return res.status(200).send("If a user with that email exists, a password reset link has been sent.");
        }
        // TODO: Implement password reset token generation and email sending
        res.status(200).send("If a user with that email exists, a password reset link has been sent.");
    });

    // Google OAuth
    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
        passport.use(new GoogleStrategy({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "/api/auth/google/callback"
        },
            async (accessToken: string, refreshToken: string, profile: any, done: any) => {
                try {
                    const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
                    const googleId = profile.id;

                    // 1. Try to find by googleId
                    let user = await storage.getUserByGoogleId(googleId);
                    if (user) return done(null, user);

                    // 2. Try to find by email
                    if (email) {
                        user = await storage.getUserByEmail(email);
                        if (user) {
                            // Link googleId to existing user
                            await storage.upsertUser({ ...user, googleId: googleId });
                            return done(null, { ...user, googleId: googleId });
                        }
                    }

                    // 3. Create new user
                    const username = email ? email.split('@')[0] : `user_${googleId}`;
                    user = await storage.upsertUser({
                        username: username,
                        email: email,
                        googleId: googleId,
                        firstName: profile.name?.givenName,
                        lastName: profile.name?.familyName,
                        password: "", // No password for social login
                    } as any);

                    return done(null, user);
                } catch (err) {
                    return done(err);
                }
            }
        ));

        app.get("/api/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));
        app.get("/api/auth/google/callback",
            passport.authenticate("google", { failureRedirect: "/auth" }),
            (req, res) => {
                res.redirect("/");
            }
        );
    }

    if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
        passport.use(new GitHubStrategy({
            clientID: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            callbackURL: "/api/auth/github/callback"
        },
            async (accessToken: string, refreshToken: string, profile: any, done: any) => {
                try {
                    const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
                    const githubId = profile.id;

                    // 1. Try to find by githubId
                    let user = await storage.getUserByGithubId(githubId);
                    if (user) return done(null, user);

                    // 2. Try to find by email
                    if (email) {
                        user = await storage.getUserByEmail(email);
                        if (user) return done(null, user);
                    }

                    // 3. Create new user
                    const username = profile.username || `user_${githubId}`;
                    user = await storage.upsertUser({
                        username: username,
                        email: email,
                        githubId: githubId,
                        firstName: profile.displayName?.split(' ')[0],
                        lastName: profile.displayName?.split(' ').slice(1).join(' '),
                        password: "",
                    } as any);

                    return done(null, user);
                } catch (err) {
                    return done(err);
                }
            }
        ));

        app.get("/api/auth/github", passport.authenticate("github", { scope: ["user:email"] }));
        app.get("/api/auth/github/callback",
            passport.authenticate("github", { failureRedirect: "/auth" }),
            (req, res) => {
                res.redirect("/");
            }
        );
    }
}


