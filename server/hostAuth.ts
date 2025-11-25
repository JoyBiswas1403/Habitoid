// server/hostAuth.ts
// Generic OAuth2 auth helper for HabitFlow
// Exports:
// - setupAuth(app: Express): register session middleware and mount auth routes
// - isAuthenticated: express middleware to protect routes
// - default export is the router (optional)

import express, { type Express, type Request, type Response, type NextFunction } from "express";
import session from "express-session";

const router = express.Router();

// Environment variables used:
// AUTH_PROVIDER_AUTH_URL, AUTH_PROVIDER_TOKEN_URL, AUTH_PROVIDER_USERINFO_URL
// AUTH_CLIENT_ID, AUTH_CLIENT_SECRET, AUTH_CALLBACK_URL
// SESSION_SECRET or HABITFLOW_SESSION_SECRET

const AUTH_PROVIDER_AUTH_URL = process.env.AUTH_PROVIDER_AUTH_URL;
const AUTH_PROVIDER_TOKEN_URL = process.env.AUTH_PROVIDER_TOKEN_URL;
const AUTH_PROVIDER_USERINFO_URL = process.env.AUTH_PROVIDER_USERINFO_URL;
const CLIENT_ID = process.env.AUTH_CLIENT_ID;
const CLIENT_SECRET = process.env.AUTH_CLIENT_SECRET;
const CALLBACK = process.env.AUTH_CALLBACK_URL;
const SESSION_SECRET = process.env.SESSION_SECRET || process.env.HABITFLOW_SESSION_SECRET || "change-me";

// Middleware to check auth
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if ((req as any).session && (req as any).session.user) return next();
  // if request expects json, return 401; else redirect to login
  if (req.headers.accept && req.headers.accept.indexOf("application/json") !== -1) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  res.redirect("/auth/login");
}

// Call this once in your main server file to setup session + routes.
// If your app already configures express-session, you may skip session setup here
// and just mount the router: app.use(hostAuthRouter)
export function setupAuth(app: Express, opts?: { skipSession?: boolean }) {
  const skipSession = opts?.skipSession ?? false;
  if (!skipSession) {
    // register express-session if not already registered
    app.use(
      session({
        secret: SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
          secure: false, // set true if using https
          httpOnly: true,
        },
      })
    );
  }

  // mount router at root so it serves /auth/*
  app.use(router);
}

// Routes
router.get("/auth/login", (req: Request, res: Response) => {
  const state = Math.random().toString(36).slice(2);
  (req as any).session = (req as any).session || {};
  (req as any).session.oauthState = state;

  const params = new URLSearchParams({
    response_type: "code",
    client_id: CLIENT_ID || "",
    redirect_uri: CALLBACK || "",
    scope: "openid profile email",
    state,
  });

  if (!AUTH_PROVIDER_AUTH_URL) {
    return res.status(500).send("Auth provider not configured.");
  }

  res.redirect(`${AUTH_PROVIDER_AUTH_URL}?${params.toString()}`);
});

router.get("/auth/callback", async (req: Request, res: Response) => {
  const { code, state } = req.query as any;
  if (!code || !state || state !== (req as any).session?.oauthState) {
    return res.status(400).send("Invalid OAuth callback");
  }

  if (!AUTH_PROVIDER_TOKEN_URL || !AUTH_PROVIDER_USERINFO_URL) {
    return res.status(500).send("Auth provider token/userinfo URL not configured.");
  }

  try {
    // Use global fetch (Node 18+) — no need to import node-fetch here.
    const tokenResp = await fetch(AUTH_PROVIDER_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: String(code),
        redirect_uri: CALLBACK || "",
        client_id: CLIENT_ID || "",
        client_secret: CLIENT_SECRET || "",
      }),
    });

    const tokenData = await tokenResp.json();
    const accessToken = tokenData.access_token;
    if (!accessToken) {
      console.error("Token response did not include access_token", tokenData);
      return res.status(400).send("No access token returned");
    }

    const userResp = await fetch(AUTH_PROVIDER_USERINFO_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const userInfo = await userResp.json();

    // store minimal user info
    (req as any).session.user = {
      id: userInfo.sub || userInfo.id || userInfo.email,
      email: userInfo.email,
      name: userInfo.name || userInfo.username,
      raw: userInfo,
    };

    res.redirect("/"); // or wherever
  } catch (err) {
    console.error("OAuth callback error:", err);
    res.status(500).send("OAuth error");
  }
});

router.get("/auth/logout", (req: Request, res: Response) => {
  if ((req as any).session) {
    (req as any).session.destroy?.(() => {
      res.redirect("/");
    });
  } else {
    res.redirect("/");
  }
});

// Export router as default too (optional)
export default router;
