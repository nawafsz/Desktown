import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";
import { URL } from 'url';

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Parse and sanitize connection string to avoid "unsupported startup parameter" errors
// with connection poolers (like Supabase Transaction mode)
let connectionString = process.env.DATABASE_URL;
try {
  const dbUrl = new URL(process.env.DATABASE_URL);
  
  // Remove any 'options' query parameter that might be in the URL (e.g. ?options=project=...)
  // as this causes the "unsupported startup parameter" error with transaction poolers
  if (dbUrl.searchParams.has('options')) {
    console.log("[DB] Removing unsupported 'options' parameter from DATABASE_URL to prevent connection errors");
    dbUrl.searchParams.delete('options');
    connectionString = dbUrl.toString();
  }
  
  console.log(`Connecting to database at ${dbUrl.hostname}:${dbUrl.port || 5432}`);
} catch (e) {
  console.log("Connecting to database (URL could not be parsed for logging)");
}

export const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Monkey-patch pool.connect to enforce search_path on every connection
// This is necessary because some connection poolers (like Supabase Transaction mode)
// do not support the "options" startup parameter, and session-level SET commands
// via "on('connect')" event are race-condition prone.
const originalConnect = pool.connect.bind(pool);
// @ts-ignore - overriding method with compatible signature
pool.connect = async (...args: any[]) => {
  // Handle callback style if ever used (unlikely by Drizzle)
  if (args.length > 0 && typeof args[0] === 'function') {
    return originalConnect(...args);
  }

  const client = await originalConnect();
  try {
    await client.query("SET search_path TO public");
  } catch (err) {
    console.error('[DB] Failed to set search_path in connection interceptor', err);
  }
  return client;
};

// Basic error handler for the pool to prevent crashes on idle connection loss
pool.on('error', (err) => {
  console.error('Unexpected error on idle database client', err);
  // Don't exit process here, let the request handler fail if needed
});

export const db = drizzle(pool, { schema, logger: true });
