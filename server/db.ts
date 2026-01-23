import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";
import { URL } from 'url';

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Log connection attempt (masking credentials)
try {
  const dbUrl = new URL(process.env.DATABASE_URL);
  console.log(`Connecting to database at ${dbUrl.hostname}:${dbUrl.port || 5432}`);
} catch (e) {
  console.log("Connecting to database (URL could not be parsed for logging)");
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  // Explicitly set search_path to public for every connection
  options: '-c search_path=public'
});

// Force search path and log it
pool.on('connect', async (client) => {
  try {
    // Force search path to public to ensure tables are found
    await client.query("SET search_path TO public");
    const res = await client.query('SHOW search_path');
    console.log(`[DB] New client connected. Search path set to: ${res.rows[0].search_path}`);
  } catch (err) {
    console.error('[DB] Failed to set search path', err);
  }
});

// Basic error handler for the pool to prevent crashes on idle connection loss
pool.on('error', (err) => {
  console.error('Unexpected error on idle database client', err);
  // Don't exit process here, let the request handler fail if needed
});

export const db = drizzle(pool, { schema, logger: true });
