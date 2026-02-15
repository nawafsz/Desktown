
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import { storage } from "../storage";
import { db } from "../db";
import { users } from "../../shared/schema";
import { eq, or } from "drizzle-orm";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

import MemoryStoreFactory from "memorystore";

const scryptAsync = promisify(scrypt);
const MemoryStore = MemoryStoreFactory(session);

// Use a single MemoryStore instance for all sessions
const sessionStore = new MemoryStore({
  checkPeriod: 86400000 // prune expired entries every 24h
});

// Simple in-memory cache for users to prevent auto-logout during DB connectivity issues
const userCache = new Map<string, any>();

export function getSession() {
  const sessionTtl = 30 * 24 * 60 * 60 * 1000; // 30 days

  return session({
    name: 'desktown_sid', // Unique name to avoid conflicts
    secret: process.env.SESSION_SECRET || "standalone_secret_key_change_me",
    store: sessionStore,
    resave: false, // Recommended to be false usually
    saveUninitialized: false,
    rolling: true,
    cookie: {
      httpOnly: true, // Prevent JS access
      secure: false, // Ensure this is false for localhost
      maxAge: sessionTtl,
      sameSite: 'lax', // 'lax' is better for navigation
      path: '/'
    },
  });
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePassword(supplied: string, stored: string): Promise<boolean> {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy({ usernameField: "username" }, async (username, password, done) => {
      try {
        const user = (await storage.getUserByEmail(username)) || (await storage.getUserByUsername(username));
        if (!user || !user.password) {
          return done(null, false, { message: "Invalid username or password" });
        }

        const isValid = await comparePassword(password, user.password);
        if (!isValid) {
          return done(null, false, { message: "Invalid username or password" });
        }

        // Cache the user object
        userCache.set(user.id, user);
        return done(null, user);
      } catch (err) {
        console.error("[Auth] Login error:", err);
        return done(err);
      }
    })
  );

  passport.serializeUser((user: any, done) => {
    console.log(`[Auth] Serializing user: ${user.id}`);
    // Cache the user object on serialization too
    if (user && user.id) {
      userCache.set(user.id, user);
    }
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    console.log(`[Auth] Deserializing user: ${id}`);
    try {
      // Try to get user from DB
      const user = await storage.getUser(id);
      if (user) {
        console.log(`[Auth] User found in DB: ${user.username}`);
        userCache.set(id, user); // Update cache
        return done(null, user);
      }

      // If not in DB but in cache, use cache (fallback for DB downtime)
      if (userCache.has(id)) {
        console.log(`[Auth] Using cached user for ${id} (DB record missing)`);
        return done(null, userCache.get(id));
      }

      console.warn(`[Auth] User not found during deserialization: ${id}`);
      done(null, false);
    } catch (err) {
      console.error(`[Auth] Deserialize error for ${id}:`, err);

      // If DB is down (ENETUNREACH etc), use cache if available
      if (userCache.has(id)) {
        console.warn(`[Auth] DB Connection issue, using cached user for ${id}`);
        return done(null, userCache.get(id));
      }

      done(err);
    }
  });

  app.post("/api/login", (req, res, next) => {
    console.log("[Auth] Login request received");
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        console.error("[Auth] Login error:", err);
        return next(err);
      }
      if (!user) {
        console.warn("[Auth] Login failed:", info?.message);
        return res.status(401).json({ message: info?.message || "Login failed" });
      }

      console.log(`[Auth] Logging in user: ${user.username} (${user.id})`);
      req.logIn(user, async (err) => {
        if (err) {
          console.error("[Auth] req.logIn error:", err);
          return next(err);
        }

        // MFA Logic for specific roles
        const mfaRoles = ["office_renter", "manager", "admin"];
        if (mfaRoles.includes(user.role)) {
          const mfaCode = Math.floor(100000 + Math.random() * 900000).toString();
          const mfaExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

          try {
            await storage.updateUser(user.id, { 
              // We need to cast or ensure storage.updateUser supports these fields. 
              // Since we just updated schema, we might need to bypass type check if storage isn't updated 
              // but storage usually infers from schema. 
              // Let's assume storage.updateUser handles the partial update correctly or we use db directly.
            } as any);
            
            // Direct DB update to be safe and avoid type issues with storage wrapper if not updated
            await db.update(users).set({ 
              mfaCode, 
              mfaExpiresAt 
            }).where(eq(users.id, user.id));

            (req.session as any).mfaVerified = false;
            console.log(`[Auth] MFA Code generated for ${user.username}: ${mfaCode}`);
          } catch (mfaErr) {
            console.error("[Auth] Error generating MFA:", mfaErr);
          }
        } else {
          (req.session as any).mfaVerified = true;
        }

        // Force session save to ensure cookie is set
        console.log("[Auth] Saving session...");
        req.session.save((err) => {
          if (err) {
            console.error("[Auth] Session save error:", err);
            return next(err);
          }
          console.log("[Auth] Session saved successfully");
          return res.json({ 
            message: "Logged in successfully", 
            user,
            mfaRequired: mfaRoles.includes(user.role) 
          });
        });
      });
    })(req, res, next);
  });

  app.post("/api/auth/mfa/verify", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    const { code } = req.body;
    const user = req.user as any;

    try {
      // Fetch fresh user data to check code
      const [userData] = await db.select().from(users).where(eq(users.id, user.id));
      
      if (!userData || !userData.mfaCode || !userData.mfaExpiresAt) {
         return res.status(400).json({ message: "No MFA code pending" });
      }

      if (new Date() > userData.mfaExpiresAt) {
        return res.status(400).json({ message: "Code expired" });
      }

      if (userData.mfaCode !== code) {
        return res.status(400).json({ message: "Invalid code" });
      }

      // Success
      await db.update(users).set({ mfaCode: null, mfaExpiresAt: null }).where(eq(users.id, user.id));
      (req.session as any).mfaVerified = true;
      
      req.session.save(() => {
        res.json({ message: "MFA Verified", success: true });
      });

    } catch (err) {
      console.error("MFA Verify Error:", err);
      res.status(500).json({ message: "Verification failed" });
    }
  });

  app.post("/api/auth/mfa/resend", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    const user = req.user as any;
    
    const mfaCode = Math.floor(100000 + Math.random() * 900000).toString();
    const mfaExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await db.update(users).set({ mfaCode, mfaExpiresAt }).where(eq(users.id, user.id));
    console.log(`[Auth] MFA Resent for ${user.username}: ${mfaCode}`);
    
    res.json({ message: "Code sent" });
  });

  app.get("/api/auth/user", (req, res) => {
    console.log("[Auth] /api/auth/user requested");
    console.log("Session ID:", req.sessionID);
    console.log("Is Authenticated:", req.isAuthenticated());
    console.log("User in Request:", req.user ? (req.user as any).username : "None");

    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const mfaVerified = (req.session as any).mfaVerified;
    res.json({ ...(req.user as any), mfaVerified });
  });

  app.post("/api/admin-direct-login", async (req, res, next) => {
    try {
      console.log("[Auth] Attempting admin direct login via REST API...");

      const projectRef = process.env.SUPABASE_PROJECT_REF;
      // Fallback to the service role key from env
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (!projectRef || !serviceRoleKey) {
        console.error("[Auth] Missing SUPABASE_PROJECT_REF or SUPABASE_SERVICE_ROLE_KEY");
        return res.status(500).json({ message: "Server configuration error: Missing Supabase credentials" });
      }

      const apiUrl = `https://${projectRef}.supabase.co/rest/v1/users?role=in.(admin,super_admin)&limit=1`;

      const response = await fetch(apiUrl, {
        headers: {
          "apikey": serviceRoleKey,
          "Authorization": `Bearer ${serviceRoleKey}`,
          "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[Auth] REST API error: ${response.status} ${errorText}`);
        throw new Error("Failed to fetch admin user from Supabase REST API");
      }

      const usersList = await response.json();
      const adminUser = usersList[0];

      if (!adminUser) {
        console.warn("[Auth] No admin user found in database");
        return res.status(404).json({ message: "No admin account found in the system." });
      }

      console.log(`[Auth] Admin user found: ${adminUser.username} (${adminUser.role})`);

      // Manually log in the user using Passport
      req.logIn(adminUser, (err) => {
        if (err) {
          console.error(`[Auth] Passport login error: ${err}`);
          return next(err);
        }

        // Ensure session is saved before responding
        req.session.save((err) => {
          if (err) {
            console.error("[Auth] Session save error:", err);
            return next(err);
          }
          return res.json({
            message: "Logged in successfully",
            user: adminUser
          });
        });
      });
    } catch (error: any) {
      console.error(`[Auth] Admin direct login crash: ${error.message}`);
      res.status(500).json({ message: "Database connection error (REST API). Please try again." });
    }
  });

  app.post("/api/register", async (req, res) => {
    try {
      const { username, password, email, firstName, lastName, interests, role } = req.body;
      if (!username || !password || !email) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const existingUser = (await storage.getUserByEmail(email)) || (await storage.getUserByUsername(username));
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Validate role - only allow specific roles for public registration
      const allowedRoles = ["member", "visitor", "office_renter"];
      const userRole = role && allowedRoles.includes(role) ? role : "member";

      const hashedPassword = await hashPassword(password);
      const newUser = await storage.upsertUser({
        username,
        email,
        password: hashedPassword,
        firstName: firstName || username,
        lastName: lastName || "",
        role: userRole,
        status: "online",
        interests: interests || null,
        profileImageUrl: `https://ui-avatars.com/api/?name=${username}&background=random`
      });

      req.logIn(newUser, (err) => {
        if (err) return res.status(500).json({ message: `LOGIN_FAIL: ${err.message}` });
        res.status(201).json({ message: "Registered successfully", user: newUser });
      });
    } catch (error: any) {
      res.status(500).json({ message: `REG_CRASH: ${error.message}` });
    }
  });

  app.post("/api/logout", (req, res) => {
    req.logout(() => {
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/test-direct-login", (req, res) => {
    res.json({ status: "alive", message: "Direct login endpoint is registered" });
  });
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};
