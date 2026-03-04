// import dns from 'dns';
// if (dns.setDefaultResultOrder) {
//   dns.setDefaultResultOrder('ipv4first');
// } 

console.log("Server starting...");
console.log("Initial DATABASE_URL:", process.env.DATABASE_URL ? "Set (length: " + process.env.DATABASE_URL.length + ")" : "Not set");

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

import "dotenv/config";

console.log("After dotenv DATABASE_URL:", process.env.DATABASE_URL ? "Set (length: " + process.env.DATABASE_URL.length + ")" : "Not set");
if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('supabase.co')) {
    console.log("WARNING: DATABASE_URL contains hostname, might be using DNS instead of IP");
}

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes.ts";
import { serveStatic } from "./static.ts";
import { createServer } from "http";
import compression from "compression";
import rateLimit from "express-rate-limit";
import cors from "cors";
import fs from "fs";
import path from "path";

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(cors());
app.use(compression());

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 200,
  message: { message: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => !req.path.startsWith('/api'),
});

app.use(apiLimiter);

app.use(
  express.json({
    limit: '50mb',
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false, limit: '50mb' }));

const landingDir = path.resolve(process.cwd(), "desktownlandingpage");
if (fs.existsSync(landingDir)) {
  app.use("/landing", express.static(landingDir));
  app.get("/landing", (_req, res) => {
    res.sendFile(path.resolve(landingDir, "index.html"));
  });
}

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    console.error(err);
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite.ts");
    await setupVite(httpServer, app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5000", 10);

  // Log startup info
  console.log("--- Server Starting ---");
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Port: ${port}`);
  try {
    const { sql } = await import("./db_postgres.ts");
    // Attempt a simple query to check database connection
    await sql`SELECT 1`;
    console.log("Database connection successful.");
  } catch (error) {
    console.error("Database connection failed:", error);
    // process.exit(1); // Exit if database connection fails
  }

  httpServer.listen(
    {
      port,
      host: "0.0.0.0",

    },
    () => {
      log(`serving on port ${port}`);
    },
  );
})();
