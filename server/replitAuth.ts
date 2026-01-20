import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";
import { pool } from "./db"; // Import common pool

const getOidcConfig = memoize(
  async () => {
    try {
      return await client.discovery(
        new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
        process.env.REPL_ID!
      );
    } catch (error) {
      console.error("Failed to discover OIDC configuration from Replit:", error);
      if (process.env.NODE_ENV === "production") {
        console.warn("Continuing without Replit OIDC in production mode...");
        return null;
      }
      throw error;
    }
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    pool: pool, // Use the existing pool with SSL settings
    createTableIfMissing: true,
    ttl: sessionTtl / 1000, // connect-pg-simple uses seconds
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Enable secure in production
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function updateUserIfRegistered(claims: any) {
  const existingUser = await storage.getUser(claims["sub"]);
  if (!existingUser) return null;

  return await storage.updateUser(existingUser.id, {
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"],
    status: "online",
    lastSeenAt: new Date(),
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  // DEV MODE OR NON-REPLIT BYPASS
  const isDev = process.env.NODE_ENV === "development";
  const isRender = process.env.RENDER === "true" || !!process.env.RENDER_EXTERNAL_URL;

  if (isDev || isRender) {
    console.log("Adding Login Bypass Route for Development/Render");
    app.get("/api/login", async (req, res) => {
      const requestedEmail = req.query.email as string || "dev@onedesk.local";
      const user = await storage.getUserByEmail(requestedEmail);

      if (!user || (user.role !== 'admin' && !isDev)) {
        console.error(`Login failed: User ${requestedEmail} not found or not authorized.`);
        return res.status(403).json({
          message: "Access restricted. Please ensure your account is registered as an administrator.",
          available_admins: ["dev@onedesk.local"]
        });
      }

      const devUser = {
        claims: {
          sub: user.id,
          email: user.email,
          first_name: user.firstName,
          last_name: user.lastName,
          profile_image_url: user.profileImageUrl,
          exp: Math.floor(Date.now() / 1000) + 3600 * 24,
        },
        expires_at: Math.floor(Date.now() / 1000) + 3600 * 24,
      };

      req.login(devUser, (err) => {
        if (err) {
          console.error("Login error:", err);
          return res.status(500).json({ message: "Login failed" });
        }
        res.redirect("/");
      });
    });

    app.get("/api/logout", (req, res) => {
      req.logout(() => {
        res.redirect("/");
      });
    });

    passport.serializeUser((user: Express.User, cb) => cb(null, user));
    passport.deserializeUser((user: Express.User, cb) => cb(null, user));

    if (isDev) return;
    // In Render, we continue to setup OIDC if it works, but fallback to bypass
  }

  try {
    const config = await getOidcConfig();
    if (!config) {
      console.warn("Replit OIDC config not available. Replit Auth routes will not be initialized.");
      return;
    }

    const verify: VerifyFunction = async (
      tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
      verified: passport.AuthenticateCallback
    ) => {
      const claims = tokens.claims();
      if (!claims || !claims.sub) {
        console.error("Invalid token: claims or sub missing");
        return verified(null, false, { message: "Invalid authentication response." });
      }

      const userInDb = await updateUserIfRegistered(claims);

      if (!userInDb || userInDb.role !== 'admin') {
        console.log(`Access denied: User ${claims.email} (${claims.sub}) is not an administrator.`);
        return verified(null, false, { message: "Access restricted to administrators only." });
      }

      const user = {};
      updateUserSession(user, tokens);
      verified(null, user);
    };

    const registeredStrategies = new Set<string>();

    const ensureStrategy = (domain: string) => {
      const strategyName = `replitauth:${domain}`;
      if (!registeredStrategies.has(strategyName)) {
        const strategy = new Strategy(
          {
            name: strategyName,
            config,
            scope: "openid email profile offline_access",
            callbackURL: `https://${domain}/api/callback`,
          },
          verify,
        );
        passport.use(strategy);
        registeredStrategies.add(strategyName);
      }
    };

    passport.serializeUser((user: Express.User, cb) => cb(null, user));
    passport.deserializeUser((user: Express.User, cb) => cb(null, user));

    app.get("/api/login", (req, res, next) => {
      ensureStrategy(req.hostname);
      passport.authenticate(`replitauth:${req.hostname}`, {
        prompt: "login consent",
        scope: ["openid", "email", "profile", "offline_access"],
      })(req, res, next);
    });

    app.get("/api/callback", (req, res, next) => {
      ensureStrategy(req.hostname);
      passport.authenticate(`replitauth:${req.hostname}`, {
        successReturnToOrRedirect: "/",
        failureRedirect: "/api/login",
      })(req, res, next);
    });

    app.get("/api/logout", async (req, res) => {
      const user = req.user as any;
      if (user?.claims?.sub) {
        await storage.updateUserStatus(user.claims.sub, "offline");
      }
      req.logout(() => {
        const endSessionUrl = client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID!,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
        });
        res.redirect(endSessionUrl.href);
      });
    });
  } catch (error) {
    console.error("Error setting up Replit Auth:", error);
  }
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const isDev = process.env.NODE_ENV === "development";
  const isRender = process.env.RENDER === "true" || !!process.env.RENDER_EXTERNAL_URL;

  if (isDev || isRender) {
    if (req.isAuthenticated()) {
      return next();
    }
    return res.status(401).json({ message: "Unauthorized" });
  }

  const user = req.user as any;

  if (!req.isAuthenticated() || !user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const config = await getOidcConfig();
    if (!config) throw new Error("OIDC config unavailable for token refresh");
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};
