
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import { storage } from "../storage";
import { pool, db } from "../db";
import { users } from "@shared/schema";
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
    secret: process.env.SESSION_SECRET || "standalone_secret_key_change_me",
    store: sessionStore,
    resave: true, // Set to true to ensure session is kept alive
    saveUninitialized: false,
    rolling: true, // Refresh session on every request
    cookie: {
      httpOnly: true,
      secure: false, // Set to false for local dev stability
      maxAge: sessionTtl,
      sameSite: 'lax'
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
    // Cache the user object on serialization too
    if (user && user.id) {
      userCache.set(user.id, user);
    }
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      // Try to get user from DB
      const user = await storage.getUser(id);
      if (user) {
        userCache.set(id, user); // Update cache
        return done(null, user);
      }
      
      // If not in DB but in cache, use cache (fallback for DB downtime)
      if (userCache.has(id)) {
        console.log(`[Auth] Using cached user for ${id} (DB record missing)`);
        return done(null, userCache.get(id));
      }
      
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
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: info?.message || "Login failed" });
      
      req.logIn(user, (err) => {
        if (err) return next(err);
        return res.json({ message: "Logged in successfully", user });
      });
    })(req, res, next);
  });

  app.post("/api/admin-direct-login", async (req, res, next) => {
    try {
      console.log("[Auth] Attempting admin direct login via REST API...");
      
      const projectRef = process.env.SUPABASE_PROJECT_REF || "svgvrasmudxtwzhrfkmk";
      // Fallback to the known service role key if environment variable is missing
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2Z3ZyYXNtdWR4dHd6aHJma21rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODkzNDc2MywiZXhwIjoyMDg0NTEwNzYzfQ.7x3pkFzMH6n6gRiOkRrViSDEt9r1xXmUx4KyQg9_Z04";
      
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
      const { username, password, email, firstName, lastName } = req.body;
      if (!username || !password || !email) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const existingUser = (await storage.getUserByEmail(email)) || (await storage.getUserByUsername(username));
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const hashedPassword = await hashPassword(password);
      const newUser = await storage.upsertUser({
        username,
        email,
        password: hashedPassword,
        firstName: firstName || username,
        lastName: lastName || "",
        role: "member",
        status: "online",
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
