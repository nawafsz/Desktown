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
});

// Basic error handler for the pool to prevent crashes on idle connection loss
pool.on('error', (err) => {
  console.error('Unexpected error on idle database client', err);
  // Don't exit process here, let the request handler fail if needed
});

export const db = drizzle(pool, { schema });
