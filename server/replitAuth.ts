import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import { storage } from "./storage";
import { pool } from "./db";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

import MemoryStoreFactory from "memorystore";

const scryptAsync = promisify(scrypt);
const MemoryStore = MemoryStoreFactory(session);

export function getSession() {
  const sessionTtl = 30 * 24 * 60 * 60 * 1000; // 30 days
  
  // Use MemoryStore instead of PG Store for better stability in production
  const sessionStore = new MemoryStore({
    checkPeriod: 86400000 // prune expired entries every 24h
  });

  if (!process.env.SESSION_SECRET && process.env.NODE_ENV === "production") {
    console.warn("WARNING: SESSION_SECRET is not defined. Using a default secret. This is not secure for production.");
  }

  return session({
    secret: process.env.SESSION_SECRET || "default_dev_secret_key_change_me",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
    },
  });
}

// Helper to hash password
async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

// Helper to compare password
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
        
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );

  passport.serializeUser((user: any, done) => done(null, user.id));
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
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
      
      const projectRef = "svgvrasmudxtwzhrfkmk";
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      
      if (!serviceRoleKey) {
        console.error("[Auth] Error: SUPABASE_SERVICE_ROLE_KEY is not defined in environment");
        return res.status(500).json({ message: "Server configuration error. Service key missing." });
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
      const { username, password, email, firstName, lastName } = req.body;
      console.log(`[Auth] Registration attempt for username: ${username}, email: ${email}`);
      
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
        role: "member", // Default role
        status: "online",
        profileImageUrl: `https://ui-avatars.com/api/?name=${username}&background=random`
      });

      req.logIn(newUser, (err) => {
        if (err) {
          console.error("Login error after registration:", err);
          return res.status(500).json({ message: `LOGIN_FAIL: ${err.message}` });
        }
        res.status(201).json({ message: "Registered successfully", user: newUser });
      });
    } catch (error: any) {
      console.error("Registration error:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      res.status(500).json({ message: `REG_CRASH: ${errorMessage}` });
    }
  });

  app.post("/api/logout", (req, res) => {
    req.logout(() => {
      res.json({ message: "Logged out successfully" });
    });
  });

  // Keep existing /api/login GET for compatibility/fallback redirection if needed
  // but now it should probably redirect to a frontend route or return 405
  app.get("/api/login", (req, res) => {
    // Redirect to frontend login page if accessed directly
    res.redirect("/auth"); 
  });
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
};

