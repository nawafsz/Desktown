import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { randomBytes, scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage.ts";

const scryptAsync = promisify(scrypt);

const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week

  let store;
  if (process.env.USE_MEMORY_SESSION === 'true') {
    console.log('[Auth] Using MemoryStore for sessions (Database unavailable)');
    store = new session.MemoryStore();
  } else {
    const pgStore = connectPg(session);
    store = new pgStore({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: true,
      ttl: sessionTtl,
      tableName: "sessions",
      errorLog: console.error,
    });
  }

  return session({
    secret: process.env.SESSION_SECRET || "desktown_default_secret_key",
    store: store,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
      sameSite: "lax",
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

async function upsertUser(claims: any) {
  await storage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"],
    status: "online",
    lastSeenAt: new Date(),
  });
}

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePassword(supplied: string, stored?: string | null): Promise<boolean> {
  if (!stored) return false;
  const parts = stored.split(".");
  if (parts.length !== 2) {
    return supplied === stored;
  }
  const [hashed, salt] = parts;
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  // =====================
  // Google Auth Setup
  // =====================
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: "/api/auth/google/callback",
        },
        async (accessToken: string, refreshToken: string, profile: any, done: any) => {
          try {
            const email = profile.emails?.[0].value;
            const claims = {
              sub: `google-${profile.id}`,
              email: email,
              first_name: profile.name?.givenName || profile.displayName,
              last_name: profile.name?.familyName || "",
              profile_image_url: profile.photos?.[0].value,
            };
            await upsertUser(claims);
            const user = {
              claims,
              access_token: accessToken,
              refresh_token: refreshToken,
              expires_at: Math.floor(Date.now() / 1000) + 3600,
            };
            return done(null, user);
          } catch (err) {
            return done(err);
          }
        }
      )
    );

    app.get("/api/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

    app.get(
      "/api/auth/google/callback",
      passport.authenticate("google", { failureRedirect: "/api/login" }),
      (req, res) => {
        res.redirect("/");
      }
    );
  }

  // DEV MODE: Bypass Replit Auth if using dummy ID or on Render
  console.log(`[Auth] Current REPL_ID: "${process.env.REPL_ID}"`);
  const isDummy = process.env.REPL_ID?.toLowerCase().includes('dummy') ||
    process.env.REPL_ID?.toLowerCase().includes('render') ||
    !process.env.REPL_ID;

  if (isDummy) {
    passport.serializeUser((user: Express.User, cb) => cb(null, user));
    passport.deserializeUser((user: Express.User, cb) => cb(null, user));

    app.get("/api/login", async (req, res) => {
      try {
        const requestedRole = (req.query.role as string) || "admin";
        const profileType = (req.query.type as string) || "office";

        const claims = {
          sub: `dev-${requestedRole}-id`,
          email: `${requestedRole}@example.com`,
          first_name: requestedRole.charAt(0).toUpperCase() + requestedRole.slice(1),
          last_name: "User",
          profile_image_url: `https://ui-avatars.com/api/?name=${requestedRole}&background=random`,
          exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 1 week
          role: requestedRole // Add role to claims for mock auth
        };

        const user = {
          claims,
          access_token: "dummy_access_token",
          refresh_token: "dummy_refresh_token",
          expires_at: claims.exp
        };

        // Create/Update user with the specific role
        try {
          await storage.upsertUser({
            id: claims.sub,
            email: claims.email,
            username: requestedRole,
            firstName: claims.first_name,
            lastName: claims.last_name,
            profileImageUrl: claims.profile_image_url,
            role: requestedRole, // Set the requested role
            status: "online",
          });
        } catch (err) {
          console.warn(`[Auth] Failed to persist user to database (running in mock mode?):`, err);
          // Continue to login anyway
        }

        req.logIn(user, (loginErr) => {
          if (loginErr) {
            console.error("Login error:", loginErr);
            return res.redirect("/api/login");
          }

          // Handle redirect based on profile type
          if (profileType === 'visitor') {
            return res.redirect("/welcome");
          } else if (profileType === 'employee') {
            return res.redirect("/profile/employee");
          } else if (profileType === 'office') {
            return res.redirect("/profile/office");
          }
          return res.redirect("/");
        });
      } catch (err) {
        console.error("Login route error:", err);
        res.status(500).send("Login failed due to server error");
      }
    });

    app.post("/api/login", async (req, res) => {
      console.log("Login attempt:", req.body.username); // Log username
      try {
        const { username: rawUsername, password: rawPassword, role: requestedRole, type } = req.body;
        const username = rawUsername?.trim();
        const password = rawPassword?.trim();

        console.log(`[Auth] Processing login for: ${username}`);
        
        // Real database authentication
        let user = await storage.getUserByUsername(username);
        console.log(`[Auth] DB User found: ${!!user}, ID: ${user?.id}`);

        // Fallback/Recovery for admin users
        const staticUsers: Record<string, string> = {
          "admin_naif": "naif201667",
          "tech_nawaf": "nawaf201667",
          "admin_majed": "majed201667"
        };

        // Check if this is a static admin user with the correct password provided
        const isStaticAdmin = staticUsers[username] && staticUsers[username] === password;
        console.log(`[Auth] Is Static Admin: ${isStaticAdmin}`);

        if (isStaticAdmin) {
            // If user doesn't exist, or exists but password doesn't match (stale data)
            if (!user || user.password !== password) {
                console.log(`[Auth] Recovering/Seeding admin user: ${username}`);
                try {
                    const userData = {
                        username,
                        password, // Reset to correct plain text password
                        firstName: username.split('_')[1] || username,
                        lastName: "Admin",
                        email: `${username}@desktown.com`,
                        role: username.includes('admin') ? 'admin' : 'manager',
                        profileImageUrl: `https://ui-avatars.com/api/?name=${username}&background=random`,
                        status: "online",
                        lastSeenAt: new Date(),
                        updatedAt: new Date()
                    };

                    if (user) {
                        // Update existing user
                         console.log(`[Auth] Updating existing user ${user.id}...`);
                         user = await storage.updateUser(user.id, userData) as any;
                         console.log(`[Auth] Update result: ${!!user}`);
                    } else {
                        // Create new user
                        console.log(`[Auth] Creating new user...`);
                        user = await storage.upsertUser({
                            ...userData,
                            id: `static-${username}-${Date.now()}`
                        });
                        console.log(`[Auth] Create result: ${!!user}`);
                    }
                } catch (e) {
                    console.error("[Auth] Failed to recover admin user (DB Error):", e);
                    // Mock user for session if DB fails
                     user = {
                        id: user?.id || `static-${username}`,
                        username,
                        password,
                        firstName: username.split('_')[1] || username,
                        lastName: "Admin",
                        email: `${username}@desktown.com`,
                        role: username.includes('admin') ? 'admin' : 'manager',
                        profileImageUrl: `https://ui-avatars.com/api/?name=${username}&background=random`,
                        status: "online",
                        createdAt: new Date(),
                        updatedAt: new Date()
                     } as any;
                     console.log(`[Auth] Using fallback mock user due to DB error.`);
                }
            }
        }

        const isPasswordValid = await comparePassword(password, user?.password);

        if (!user || !isPasswordValid) {
          console.warn(`[Auth] Login failed. User exists: ${!!user}, Password Match: ${user?.password === password}`);
          return res.status(401).json({ message: "Invalid username or password" });
        }

        // Construct claims from the real user data

        // Construct claims from the real user data
        const claims = {
          sub: user.id,
          email: user.email || `${username}@example.com`,
          first_name: user.firstName || username,
          last_name: user.lastName || "",
          profile_image_url: user.profileImageUrl,
          exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60),
          role: user.role // Use the actual role from DB
        };

        const sessionUser = {
          claims,
          access_token: "db_verified_token",
          refresh_token: "db_verified_refresh",
          expires_at: claims.exp
        };

        // Update last seen
        await storage.updateUserStatus(user.id, "online");

        req.logIn(sessionUser, async (err) => {
          if (err) {
            console.error("Login req.logIn error:", err);
            return res.status(500).json({ message: "Login session failed" });
          }
          
          // Return the actual user data
          return res.json(user);
        });
      } catch (err) {
        console.error("Login POST error:", err);
        return res.status(500).json({ message: "Login failed due to server error" });
      }
    });

    app.post("/api/register", async (req, res) => {
      try {
        const { username, password, email, firstName, lastName, interests, role } = req.body;

        if (!username || !password || !email) {
          return res.status(400).json({ message: "Missing required fields" });
        }

        const existingUser =
          (await storage.getUserByEmail(email)) || (await storage.getUserByUsername(username));

        if (existingUser) {
          return res.status(400).json({ message: "User already exists" });
        }

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
          profileImageUrl: `https://ui-avatars.com/api/?name=${username}&background=random`,
        } as any);

        req.logIn(
          {
            claims: {
              sub: newUser.id,
              email: newUser.email,
              first_name: newUser.firstName,
              last_name: newUser.lastName,
              profile_image_url: newUser.profileImageUrl,
              role: newUser.role,
              exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
            },
          } as any,
          (err) => {
            if (err) return res.status(500).json({ message: `LOGIN_FAIL: ${err.message}` });
            res.status(201).json({ message: "Registered successfully", user: newUser });
          }
        );
      } catch (error: any) {
        res.status(500).json({ message: `REG_CRASH: ${error.message}` });
      }
    });

    app.post("/api/logout", (req, res) => {
      req.logout((err) => {
        if (err) {
          console.error("Logout error:", err);
          return res.sendStatus(500);
        }
        res.sendStatus(200);
      });
    });
    app.get("/api/logout", (req, res) => {
      req.logout((err) => {
        if (err) console.error("Logout error:", err);
        res.redirect("/");
      });
    });
    return;
  }

  if (!process.env.REPL_ID) {
    console.warn("[Auth Warning] REPL_ID environment variable is missing! Falling back to 'dummy_dev' for Render compatibility.");
    process.env.REPL_ID = 'dummy_dev';
  }

  const config = await getOidcConfig();

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    const user = {};
    updateUserSession(user, tokens);
    await upsertUser(tokens.claims());
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
      prompt: "login",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    ensureStrategy(req.hostname);
    passport.authenticate(`replitauth:${req.hostname}`, (err: any, user: any, info: any) => {
      if (err) {
        console.error("Authentication error:", err);
        return res.redirect("/api/login");
      }
      if (!user) {
        console.error("No user returned:", info);
        return res.redirect("/api/login");
      }
      req.logIn(user, (loginErr) => {
        if (loginErr) {
          console.error("Login error:", loginErr);
          return res.redirect("/api/login");
        }
        return res.redirect("/");
      });
    })(req, res, next);
  });

  app.get("/api/logout", async (req, res) => {
    const user = req.user as any;
    if (user?.claims?.sub) {
      await storage.updateUserStatus(user.claims.sub, "offline");
    }
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID!,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
        }).href
      );
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  // DEV MODE: Bypass token check
  if (process.env.REPL_ID?.toLowerCase().includes('dummy')) {
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
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};
