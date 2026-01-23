import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";
import { URL } from 'url';
import dns from "dns";

// Force IPv4 globally to resolve ENETUNREACH on IPv6 addresses
dns.setDefaultResultOrder('ipv4first');

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Ensure we use the most stable connection settings for Supabase
let connectionString = process.env.DATABASE_URL;

try {
  const dbUrl = new URL(connectionString);
  
  // Use port 6543 (pooler port) by default if it was provided
  // or switch to 5432 if 6543 fails.
  // Actually, port 6543 is better for IPv4 stability in some regions.
  
  // Remove problematic parameters for direct connections
  dbUrl.searchParams.delete('options');
  dbUrl.searchParams.delete('sslmode');
  
  connectionString = dbUrl.toString();
  console.log(`[DB] Sanitized connection: ${dbUrl.hostname}:${dbUrl.port || 5432}`);
} catch (e) {
  console.log("[DB] Using DATABASE_URL as provided");
}

export const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 15000, // Increase timeout for slower networks
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
  // Force IPv4 for the database connection to prevent ENETUNREACH on IPv6-only networks
  // @ts-ignore - 'family' is supported by pg but might not be in the typings for all versions
  family: 4
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
    return (originalConnect as any)(...args);
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
