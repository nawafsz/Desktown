import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";
import { URL } from 'url';

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Prefer individual PG environment variables for better stability and avoiding URL parsing issues
const poolConfig = {
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'Rayan201667$',
  host: process.env.PGHOST || 'db.svgvrasmudxtwzhrfkmk.supabase.co',
  port: parseInt(process.env.PGPORT || '5432'),
  database: process.env.PGDATABASE || 'postgres',
  ssl: {
    rejectUnauthorized: false,
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000
};

console.log(`[DB] Connecting to database at ${poolConfig.host}:${poolConfig.port} as ${poolConfig.user}`);

export const pool = new Pool(poolConfig);

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
